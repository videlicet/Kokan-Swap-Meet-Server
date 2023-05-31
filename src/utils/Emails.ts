export function verificationEmail(username: string, verificationCode: string) {
  return `<!DOCTYPE html>
    <html>
        ${head}
        <body>
            <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="max-width: 600px;" class="center">
                <tr>
                    <td align="center" style="padding: 0px 0;" bgcolor="#000000">
                        <img src="https://res.cloudinary.com/dm3zfi4kh/image/upload/v1684659424/kokan_header.png" alt="Kokan Logo" width="200">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 30px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td>
                                    <h1>Welcome to Kokan!</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 0;">
                                    <p>Hello ${username},</p>
                                    <p>Thank you for registering with Kokan. To get started, please verify your account by clicking
                                        on the button below:</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}email-verification?vcode=${verificationCode}&user=${username}"
                                        style="background-color: #000000; color: #ffffff; padding: 10px 20px; text-decoration: none; text-transform: uppercase; border-radius: 4px; font-weight: bold;">Verify
                                        Account</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 0;">
                                    <p>If the button above doesn't work, you can also copy and paste the following link into your
                                        browser:</p>
                                    <p><a href="${process.env.FRONTEND_URL}email-verification?vcode=${verificationCode}&user=${username}">${process.env.FRONTEND_URL}email-verification?vcode=${verificationCode}&user=${username}</a>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>This verfication e-mail is valid for 10 minutes. Once your account is verified, you'll be able to access all the great features of Kokan.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#000000" align="center" style="padding: 20px 30px;">
                        <p style="color: #777777;">You received this email because you registered at Kokan. If you didn't
                            create an account, please ignore this email.</p>
                    </td>
                </tr>
            </table>
        </body>
    </html>
    `
}

export function incomingSwapRequestEmail(
  usernameRequester: string,
  usernameOwner: string,
  assetTitle: string,
) {
  return `<!DOCTYPE html>
      <html>
        ${head}
          <body>
              <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="max-width: 600px;" class="center">
                  <tr>
                      <td align="center" style="padding: 0px 0;" bgcolor="#000000">
                          <img src="https://res.cloudinary.com/dm3zfi4kh/image/upload/v1684659424/kokan_header.png" alt="Kokan Logo" width="200">
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 0 30px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                  <td>
                                      <h1>Incoming Swap Request</h1>
                                  </td>
                              </tr>
                              <tr>
                                  <td style="padding: 20px 0;">
                                      <p>Hello ${usernameOwner},</p>
                                      <p>You have received a swap request for your asset ${assetTitle} from user ${usernameRequester}. Please log in to Kokan an react to this swap request within five days.</p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td bgcolor="#000000" align="center" style="padding: 20px 30px;">
                          <p style="color: #777777;">You received this email because you are a Kokan member. If you don't have a Kokan account, please ignore this email.</p>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
      `
}

const head = `          <head>
  <meta charset="utf-8">
  <title>Welcome to Kokan!</title>
  <style>
  html {
      background: linear-gradient(16deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
      margin: 0;
      padding: 0;
      height: 100vh;
      color: rgb(221, 213, 207);
      font-style: "Rubik", Arial, Helvetica, sans-serif;
  }
  
  table {
      margin: 0 auto;
  }

  p {
      font-weight: bold;
  }

  a {
      color: rgb(221, 213, 207);
  }

  .center {
      border: 5px solid black;
      border-radius: 15px;
      background-color: rgba(0, 0, 0, 0.6);
      min-height: 0;
      height: 100%;
  }
  </style>
</head>`
