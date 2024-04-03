const fs = require('fs');
const { exec, execSync } = require('child_process');

const rawData = fs.readFileSync('./../../data/sessionize.json');
const template = fs.readFileSync('template.svg', { encoding: 'utf-8' });
const data = JSON.parse(rawData);

// convert to png
execSync(`"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "png/outro.png" --export-type "png" "outro.svg"`, (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
});

execSync(`"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "png/technical-issues.png" --export-type "png" "technical-issues.svg"`, (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
});

execSync(`"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "png/technical-issues-cancelled.png" --export-type "png" "technical-issues-cancelled.svg"`, (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
});

execSync(`"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "png/global-azure-at.png" --export-type "png" "global-azure-at.svg"`, (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
});

for (let session of data.sessions) {
    try {
        console.log(session.title);

        const answers = session.questionAnswers;
        let shortTitle = answers.find(q => q.questionId === 71787).answerValue;
        shortTitle = shortTitle.replace('&', 'and');

        // title
        let words = session.title.split(' ');
        let chars = 0;
        let title1 = '';
        let title2 = '';

        for (let word of words) {
            if (chars + word.length < 52 && !title2) {
                if (title1) {
                    title1 += ' ';
                    chars++;
                }

                title1 += word;
                chars += word.length;
            } else {
                if (title2) {
                    title2 += ' ';
                    chars++;
                }

                title2 += word;
                chars += word.length;
            }
        }

        let svg = template.replace('{{title1}}', title1.replace('&', '&amp;'));
        svg = svg.replace('{{title2}}', title2.replace('&', '&amp;'));

        // speaker
        const speakers = session.speakers.map(speakerId => data.speakers.find(s => s.id === speakerId));
        let speakersText = speakers.sort((a, b) => a.lastName > b.lastName ? 1 : -1).map(s => s.firstName + ' ' + s.lastName + (s.tagLine && speakers.length === 1 ? ', ' + s.tagLine : '')).join(', ');
        speakersText = speakersText.replace('&', 'and');
        if (speakers.length > 1 && shortTitle === 'dwh-porsche') {
            speakersText += ' (Porsche Holding Salzburg)';
        }
        svg = svg.replace('{{speakers}}', speakersText);

        // start and endtime
        let startDate = new Date(session.startsAt);
        let endDate = new Date(session.endsAt);
        svg = svg.replace('{{startTime}}', (startDate.getHours() < 10 ? '0' : '') + startDate.getHours() + ':' + (startDate.getMinutes() < 10 ? '0' : '') + startDate.getMinutes());
        svg = svg.replace('{{endTime}}', (endDate.getHours() < 10 ? '0' : '') + endDate.getHours() + ':' + (endDate.getMinutes() < 10 ? '0' : '') + endDate.getMinutes());

        // speaker image
        let speakerImg = '';
        let x = 860 - (speakers.length - 1) * 140;
        console.log('   ', speakers.length);
        let i = 0;
        const y = 200;
        for (let speaker of speakers) {

            svg = svg.replace('{{speakerUrl}}', speaker.profilePicture);

            speakerImg += `<clipPath id="clipSpeaker${i}"><circle cx="${x + 110}" cy="${y + 110}" r="110" /></clipPath><image x="${x}" y="${y}" width="220" height="220" clip-path="url(#clipSpeaker${i})" xlink:href="${speaker.profilePicture}" />`;
            x += 280;
            i++;
        }

        svg = svg.replace('speakerImg', speakerImg);

        // link
        svg = svg.replace('{{link}}', shortTitle);

        // joinText
        svg = svg.replace('{{joinText}}', speakers.length > 1 ? 'Join us' : 'Join me');

        // save
        fs.writeFileSync('./svg/' + shortTitle + '.svg', svg, { encoding: 'utf-8' });

        // convert to png
        execSync(`"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "png/${shortTitle}.png" --export-type "png" "svg\\${shortTitle}.svg"`, (error, stdout, stderr) => {
            console.log('   ', error, stdout, stderr);
        });

    } catch (error) {
        console.log(error, session);
    }
}
