/*****
 * Copyright (c) 2017-2022 Kode Programming
 * https://github.com/KodeProgramming/kode/blob/main/LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*****/


/*****
 * A session is used for associated a single user endpoint with a server user
 * context.  The server context is always a webx or an extension of a webx.  The
 * first reason for developing the session was to support web applcations, which
 * are web extensions.  A session can also be associated with another endpoint
 * that's a host that's not on a client application.
*****/
register(class Session {
    constructor(user, idleMinutes) {
        return new Promise(async (ok, fail) => {
            this.timeout = null;
            this.user = mkUserObject(user);
            this.idleMinutes = idleMinutes;
            this.pendingMessages = [];
            let dbc = await dbConnect();

            let seed = `${(new Date()).toString()}${this.user.userName}`;
            this.key = await Crypto.digestUnsalted('sha512', `${seed}${Math.random()}`);

            while (this.key in SessionManager.byKey) {
                this.key = await Crypto.digestUnsalted('sha512', `${seed}${Math.random()}`);
            }

            this.grants = mkStringSet((await this.user.getGrants(dbc)).map(grant => grant.context));

            await dbc.rollback();
            await dbc.free();

            ok(this);
        });
    }

    async authorize(permission, requestContext) {
        if (permission) {
            let context = mkContext(requestContext);
            context.permission = permission;

            if (this.grants.has(context.toBase64())) {
                return { granted: true, user: this.user };
            }
            else if ('org' in context) {
                delete context.org;

                if (this.grants.has(context.toBase64())) {
                    return { granted: true, user: this.user };
                }
            }

            return { granted: false, user: this.user };
        }

        return { granted: true, user: this.user };
    }

    async close() {
        if (this.timeout) {
            clearInterval(this.timeout);
        }

        SessionManager.removeSession(this);
    }

    queue(message) {
        this.pendingMessages.push(message);
    }

    setSecurityContext(contextName, value) {
        this.contexts[contextName] = value;
        return this;
    }

    sweep() {
        if (this.pendingMessages.length) {
            let pendingMessages = this.pendingMessages;
            this.pendingMessages = [];
            return pendingMessages;
        }

        return this.pendingMessages;
    }

    touch() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => this.close(), this.idleMinutes*60*1000);
    }
});