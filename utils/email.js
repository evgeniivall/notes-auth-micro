const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const htmlToText = require("html-to-text");
const moment = require("moment");
const path = require("path");

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Notes App <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    let prefix = "";
    if (process.env.NODE_ENV === "development") prefix = "MAILTRAP_";

    return nodemailer.createTransport({
      host: process.env[`${prefix}EMAIL_HOST`],
      port: process.env[`${prefix}EMAIL_PORT`],
      auth: {
        user: process.env[`${prefix}EMAIL_USERNAME`],
        pass: process.env[`${prefix}EMAIL_PASSWORD`],
      },
    });
  }

  loadTemplate(templateName, variables) {
    const templatePath = path.join(
      __dirname,
      `../views/emails/${templateName}.hbs`
    );
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);
    return compiledTemplate(variables);
  }

  async send(subject, html) {
    const mail = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.createTransport().sendMail(mail);
  }

  async sendWelcome() {
    const url = process.env.UI_APP_URL;
    const html = this.loadTemplate("welcome", {
      firstName: this.firstName,
      url,
    });
    await this.send("Welcome to Notes App", html);
  }

  async sendPasswordReset(token) {
    const resetURL = `${process.env.UI_APP_URL}/resetPassword/${token}`;
    const tokenExprireMinutes = `${moment
      .duration(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN_SEC, "seconds")
      .humanize()}`;
    const html = this.loadTemplate("passwordReset", {
      firstName: this.firstName,
      url: resetURL,
      tokenExprireMinutes,
    });
    await this.send("Your password reset token", html);
  }
};
