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
 * A panel that's used for editing a network interface.  This panel is able to
 * edit all aspects of a single network interface, whose data is stored in the
 * server configuration file, builtin.json.  All aspects of the network interface
 * may modified with this panel.  System admin beware, if you deactivate the
 * network interface you're currently using, the server will reboot without it
 * being available.
*****/
register(class FWNetIfaceView extends WPanel {
    constructor(ifaceName) {
        super('form');
        this.ifaceName = ifaceName;
        this.append(mkWidget('h3').set(`${txx.fwNetInterface} "${ifaceName}"`));
        this.editor = mkWObjectEditor();

        (async () => {
            this.iface = await queryServer({
                messageName: 'ConfigGetNetIface',
                ifaceName: ifaceName
            });

            let acme = (await queryServer({
                messageName: 'ConfigListAcmeProviders',
            })).map(ca => ({ value: ca.provider, text: ca.name }));

            let keyMenu = mkWPopupMenu()
            .append(
                mkWMenuItem('CreateKeys', txx.fwNetCreateKeyPair)
                .setAction(() => this.createKeyPair())
            );

            let publicKeyMenu = mkWPopupMenu()
            .append(
                mkWMenuItem('Certify', txx.fwNetCopyKeyPem)
                .setAction(() => this.copyPublicKey('pem'))
                .bind(this.editor.modifiable, 'publicKey', (mi, value) => value == '[NONE]' ? mi.disable() : mi.enable())
            )
            .append(
                mkWMenuItem('CreateKeys', txx.fwNetCreateKeyPair)
                .setAction(() => this.createKeyPair())
            );

            let certMenu = mkWPopupMenu()
            .append(
                mkWMenuItem('Certify', txx.fwNetCertify)
                .setAction(() => this.certify())
                .bind(this.editor.modifiable, 'privateKey', (mi, value) => value == '[NONE]' ? mi.disable() : mi.enable())
            );

            this.editor.addObj(this.iface, {
                address: {
                    label: txx.fwNetAddress,
                    readonly: false,
                    type: ScalarIp,
                },
                domain: {
                    label: txx.fwNetDomain,
                    readonly: false,
                    type: ScalarHost,
                },
                host: {
                    label: txx.fwNetHost,
                    readonly: false,
                    type: ScalarHost,
                },
            })
            .addObj(this.iface.tls, {
                acme: {
                    label: txx.fwNetAcme,
                    readonly: false,
                    type: ScalarEnum,
                    choices: acme,
                },
                privateKey: {
                    label: txx.fwNetPrivateKey,
                    readonly: true,
                    type: ScalarText,
                    menu: keyMenu,
                },
                publicKey: {
                    label: txx.fwNetPublicKey,
                    readonly: true,
                    type: ScalarText,
                    menu: publicKeyMenu,
                },
                keyCreated: {
                    label: txx.fwNetKeyCreatedDate,
                    readonly: true,
                    type: ScalarDateTime,
                    menu: keyMenu,
                },
                cert: {
                    label: txx.fwNetCert,
                    readonly: true,
                    type: ScalarText,
                    menu: certMenu,
                },
                caCert: {
                    label: txx.fwNetCaCert,
                    readonly: true,
                    type: ScalarText,
                    menu: certMenu,
                },
            });

            this.append(this.editor);
        })();
    }

    async certify() {
        console.log('certify');
    }

    async copyPublicKey(format) {
        let key = await queryServer({
            messageName: 'ConfigCopyPublicKey',
            ifaceName: this.ifaceName,
            format: format,
        });

        console.log(key);
    }

    async createKeyPair() {
        await queryServer({
            messageName: 'ConfigCreateKeyPair',
            ifaceName: this.ifaceName,
        });
    }

    async revert() {
        await this.editor.revert();
    }

    async save() {
        let message = {
            messageName: 'UpdateNetIface',
            ifaceName: this.ifaceName,
        };

        for (let field of this.editor.getFields()) {
            if (field.name in this.iface) {
                message[field.name] = field.value;
            }
            else if (field.name == 'acme') {
                message.acme = field.value;
            }
        }

        await queryServer(message);
    }

    async update() {
        await this.editor.update();
    }
});