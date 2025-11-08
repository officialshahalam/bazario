import axios from "axios";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

// render a EJS mail templete
const renderEmailTemplete = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "order-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );
  return ejs.renderFile(templatePath, data);
};

//send email
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderEmailTemplete(templateName, data);
    await axios.post(`${process.env.N8N_EMAIL_URL}`, {
      to: to,
      subject: subject,
      html: html,
    });
    return true;
  } catch (e) {
    console.error("❌ Error sending email:", e);
    return false;
  }
};
