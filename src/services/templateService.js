const templates = {
  welcome: {
    subject: 'Welcome, {{name}}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, {{name}}!</h1>
        <p>Thank you for joining us. We're excited to have you on board.</p>
        <p>Your account has been successfully created.</p>
        <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0;">Need help? Contact our support team.</p>
        </div>
      </div>
    `,
    text: 'Welcome, {{name}}! Thank you for joining us.'
  },
  
  passwordReset: {
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>Hello {{name}},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="{{resetUrl}}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px; color: #666;">This link expires in 1 hour.</p>
      </div>
    `,
    text: 'Password reset link: {{resetUrl}}'
  },
  
  notification: {
    subject: '{{title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">{{title}}</h1>
        <p>{{message}}</p>
        <p style="color: #666; font-size: 12px;">Sent at {{timestamp}}</p>
      </div>
    `,
    text: '{{title}}\n\n{{message}}'
  }
};

class TemplateService {
  render(templateName, data = {}) {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const renderString = (str) => {
      return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
      });
    };

    return {
      subject: renderString(template.subject),
      html: renderString(template.html),
      text: renderString(template.text)
    };
  }

  listTemplates() {
    return Object.keys(templates);
  }

  addTemplate(name, template) {
    templates[name] = template;
  }
}

module.exports = new TemplateService();
