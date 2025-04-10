import { exec } from "child_process";
import fs from "fs";

export async function executePlan(plan) {
  const lines = plan.split("\n").map((line) => line.trim());
  for (const line of lines) {
    if (line.startsWith("RUN:")) {
      const command = line.replace("RUN:", "").trim();
      console.log(`Executing shell command: ${command}`);

      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.log(`Error executing command: ${error.message}`);
            reject(error);
            return;
          }
          console.log(stdout);
          console.error(stderr);
          resolve();
        });
      });
    } else if (line.startsWith("FILE:")) {
      const [filePart, contentPart] = line.split("CONTENT:");
      const filename = filePart.replace("FILE:", "").trim();
      const content = contentPart.trim();

      console.log(`Writing content to file: ${filename}`);
      fs.writeFileSync(filename, content, { encoding: "utf8" });
    }
  }
}
