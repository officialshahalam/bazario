import axios from "axios";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();
export const getTemplatePath = (templateName: string) => {
  // Path for LOCAL development
  const localPath = path.join(
    process.cwd(),
    "apps",
    "order-service",
    "src",
    "assets",
    "email-templates",
    `${templateName}.ejs`
  );

  // Path for PRODUCTION (Docker)
  const prodPath = path.join(
    process.cwd(),
    "src",
    "assets",
    "email-templates",
    `${templateName}.ejs`
  );

  if (process.env.NODE_ENV === "production") {
    return prodPath;
  }
  return localPath;
};

// render a EJS mail templete
const renderEmailTemplete = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = getTemplatePath(templateName);
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
