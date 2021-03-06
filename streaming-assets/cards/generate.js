const fs = require('fs');
const { exec, execSync } = require('child_process');

const rawData = fs.readFileSync('./../../data/sessionize.json');
const template = fs.readFileSync('template.svg', { encoding: 'utf-8' });
const templateWithoutLogo = fs.readFileSync('template-without-logo.svg', {
  encoding: 'utf-8',
});
const data = JSON.parse(rawData);

// convert to png
execSync(
  `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/outro.png" --export-type "png" "outro.svg"`,
  (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
  }
);

execSync(
  `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/battleship.png" --export-type "png" "battleship.svg"`,
  (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
  }
);

execSync(
  `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/technical-issues.png" --export-type "png" "technical-issues.svg"`,
  (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
  }
);

execSync(
  `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/technical-issues-cancelled.png" --export-type "png" "technical-issues-cancelled.svg"`,
  (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
  }
);

execSync(
  `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/global-azure-at.png" --export-type "png" "global-azure-at.svg"`,
  (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
  }
);

execSync(
  `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/coffee-break.png" --export-type "png" "coffee-break.svg"`,
  (error, stdout, stderr) => {
    console.log('   ', error, stdout, stderr);
  }
);

const qaTemplate = fs.readFileSync('q-and-a.svg', { encoding: 'utf-8' });
for (let stage = 1; stage <= 4; stage++) {
  let svg = qaTemplate.replace('{{stage}}', stage.toString());

  fs.writeFileSync('./svg/q-and-a-stage-' + stage.toString() + '.svg', svg, {
    encoding: 'utf-8',
  })

  execSync(
    `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/q-and-a-stage-${stage}.png" --export-type "png" "svg/q-and-a-stage-${stage}.svg"`,
    (error, stdout, stderr) => {
      console.log('   ', error, stdout, stderr);
    }
  );
}

return;

for (let session of data.sessions) {
  try {
    console.log(session.title);

    // const answers = session.questionAnswers;
    // let shortTitle = answers.find(q => q.questionId === 28454).answerValue;
    // shortTitle = shortTitle.replace('&', 'and');
    let shortTitle = session.title.replace(/: /g, ' - ');

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
    const speakers = session.speakers.map((speakerId) =>
      data.speakers.find((s) => s.id === speakerId)
    );
    let speakersText = speakers
      .sort((a, b) => (a.lastName > b.lastName ? 1 : -1))
      .map(
        (s) =>
          s.firstName +
          ' ' +
          s.lastName +
          (s.tagLine && speakers.length === 1 ? ', ' + s.tagLine : '')
      )
      .join(', ');
    if (speakers.length > 1 && shortTitle === 'dwh-porsche') {
      speakersText += ' (Porsche Holding Salzburg)';
    }
    svg = svg.replace('{{speakers}}', speakersText);

    // start and endtime
    let startDate = new Date(session.startsAt);
    let endDate = new Date(session.endsAt);
    svg = svg.replace(
      '{{startTime}}',
      (startDate.getHours() < 10 ? '0' : '') +
        startDate.getHours() +
        ':' +
        (startDate.getMinutes() < 10 ? '0' : '') +
        startDate.getMinutes()
    );
    svg = svg.replace(
      '{{endTime}}',
      (endDate.getHours() < 10 ? '0' : '') +
        endDate.getHours() +
        ':' +
        (endDate.getMinutes() < 10 ? '0' : '') +
        endDate.getMinutes()
    );

    // speaker image
    let speakerImg = '';
    let x = 860 - (speakers.length - 1) * 140;
    console.log('   ', speakers.length);
    let i = 0;
    const y = 200;
    for (let speaker of speakers) {
      svg = svg.replace('{{speakerUrl}}', speaker.profilePicture);

      speakerImg += `<clipPath id="clipSpeaker${i}"><circle cx="${
        x + 110
      }" cy="${
        y + 110
      }" r="110" /></clipPath><image x="${x}" y="${y}" width="220" height="220" clip-path="url(#clipSpeaker${i})" xlink:href="${
        speaker.profilePicture
      }" />`;
      x += 280;
      i++;
    }

    svg = svg.replace('speakerImg', speakerImg);

    // link
    svg = svg.replace('{{link}}', shortTitle);

    // joinText
    svg = svg.replace(
      '{{joinText}}',
      speakers.length > 1 ? 'Join us' : 'Join me'
    );

    // save
    fs.writeFileSync('./svg/' + shortTitle + '.svg', svg, {
      encoding: 'utf-8',
    });

    fs.writeFileSync(
      './svg/' + shortTitle + '-without-logo.svg',
      svg.replace(
        '<image x="1700" y="20" width="200" height="154" xlink:href="../../gab2022.png" />',
        ''
      ),
      {
        encoding: 'utf-8',
      }
    );

    let stage = (
      data.rooms.find((r) => r.id === session.roomId).sort + 1
    ).toString();
    if (stage === '5') {
      stage = '4';
    }

    const filename =
      session.startsAt.substr(11, 5).replace(/:/g, '') +
      ' - stage ' +
      stage +
      ' - ' +
      shortTitle;

    // convert to png
    execSync(
      `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards/${filename}.png" --export-type "png" "svg\\${shortTitle}.svg"`,
      (error, stdout, stderr) => {
        console.log('   ', error, stdout, stderr);
      }
    );

    execSync(
      `"C:\\Program Files\\Inkscape\\bin\\inkscape" --export-filename "../../static/sessions/cards-without-logo/${filename}.png" --export-type "png" "svg\\${shortTitle}-without-logo.svg"`,
      (error, stdout, stderr) => {
        console.log('   ', error, stdout, stderr);
      }
    );
  } catch (error) {
    console.log(error, session);
  }
}
