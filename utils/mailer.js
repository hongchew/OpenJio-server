const nodemailer = require('nodemailer');

module.exports.sendEmail = async (email, content) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'openjio4103@gmail.com',
        pass: '4103openjio',
      },
    });
  
    var mailOptions = {
      from: '"OpenJio No-Reply" <no-reply@openjio.com>',
      to: email,
      subject: content.subject,
      html: content.text,
    };
  
    return transporter.sendMail(mailOptions);
  };