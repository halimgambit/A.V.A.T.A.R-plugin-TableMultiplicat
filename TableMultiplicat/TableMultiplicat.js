export async function init () {
    await Avatar.lang.addPluginPak('TableMultiplicat');
}

export async function action(data, callback) {

    try {

         const L = await Avatar.lang.getPak('TableMultiplicat', data.language);

        const tblActions = {
            getMultiplication: () => getMultiplication(data, data.client, L)
        };
        
        info("TableMultiplication:", data.action.command, "from", data.client);
            
        if (tblActions[data.action.command]) {
            tblActions[data.action.command]();
        }

    } catch (err) {
        if (data.client) Avatar.Speech.end(data.client);
        if (err.message) error(err.message);
    }

    callback();
}

const getMultiplication = (data, client, L) => {

    try {

        const match = data.sentence.match(/\d+/);

        if (!match) {
            return Avatar.speak(L.get(["speech.noUnderstand"]), client, () => {
                Avatar.Speech.end(client);
            });
        }

        const number = parseInt(match[0], 10);

        if (number < 0 || number > 100) {
            return Avatar.speak(L.get(["speech.noNumber"]), client, () => {
                Avatar.Speech.end(client);
            });
        }

        const table = [];

        for (let i = 1; i <= 10; i++) {
            table.push(`${number} fois ${i} égale ${number * i}`);
        }

        info(`Table de multiplication de ${number}`);
        info(table);

        const speakQueue = (lines, client, endCallback) => {
            let i = 0;

            const next = () => {
                if (!lines || i >= lines.length) {
                    return endCallback?.() || Avatar.Speech.end(client);
                }

                Avatar.speak(L.get(["speech.line", lines[i++]]), client, next);
            };
            next();
        };

        Avatar.speak(L.get(["speech.speak", number]), client, () => {
                speakQueue(table, client);
            }
        );

    } catch (err) {
        error("Erreur plugin multiplication:", err);
        Avatar.speak(L.get(["speech.error"]), client, () => {
            Avatar.Speech.end(client);
        });
    }
};
