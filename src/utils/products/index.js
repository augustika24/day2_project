import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const filePath = path.join(__dirname, "..", "..", "Products.json");
console.log(filePath,"-------filepath")

export const sendResponse = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(body));
};


export const readProductsFromFile = () => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const data = fs.readFileSync(filePath, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const writeProductsToFile = (products) => {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
};

