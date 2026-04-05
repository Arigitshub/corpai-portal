import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROLES_DIR = "d:/Ari/CorpAI/roles";

export async function GET() {
  try {
    if (!fs.existsSync(ROLES_DIR)) {
      return NextResponse.json({ error: "Roles directory not found" }, { status: 404 });
    }

    const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith(".md") && !file.toUpperCase().includes("README")) {
          arrayOfFiles.push(fullPath);
        }
      });

      return arrayOfFiles;
    };

    const filePaths = getAllFiles(ROLES_DIR);
    
    const roles = filePaths.map(filePath => {
      const content = fs.readFileSync(filePath, "utf-8");
      
      const titleMatch = content.match(/^#\s+\[(L[1-5]|OWNER)\]\s+(.+?)(?:\s+—.*)?$/m);
      const title = titleMatch ? titleMatch[2].trim() : path.basename(filePath, ".md");
      const rank = titleMatch ? titleMatch[1].toUpperCase() : "Unknown";
      
      const reportsMatch = content.match(/\|\s+\*\*Reports to\*\*\s+\|\s+(.+?)\s+\|/i);
      const reportsTo = reportsMatch ? reportsMatch[1].trim() : "OWNER";

      const deptMatch = content.match(/\|\s+\*\*Department\*\*\s+\|\s+(.+?)\s+\|/i);
      const department = deptMatch ? deptMatch[1].trim() : path.dirname(filePath).split(path.sep).pop();

      return {
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        rank,
        reportsTo,
        department,
        path: filePath
      };
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
