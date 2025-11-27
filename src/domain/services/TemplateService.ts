import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export class TemplateService {
  private templatesDir: string;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(templatesDir: string = 'templates') {
    this.templatesDir = path.resolve(templatesDir);
    this.loadTemplates();
  }

  private loadTemplates(): void {
    if (!fs.existsSync(this.templatesDir)) {
      console.warn(`Templates directory not found: ${this.templatesDir}`);
      return;
    }

    const files = fs.readdirSync(this.templatesDir);
    files.forEach(file => {
      if (file.endsWith('.hbs') || file.endsWith('.handlebars')) {
        const templateName = file.replace(/\.(hbs|handlebars)$/, '');
        const templatePath = path.join(this.templatesDir, file);
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        this.compiledTemplates.set(templateName, Handlebars.compile(templateSource));
      }
    });

    console.log(`Loaded ${this.compiledTemplates.size} email templates`);
  }

  render(templateName: string, data: Record<string, any>): string {
    const template = this.compiledTemplates.get(templateName);
    
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    return template(data);
  }

  hasTemplate(templateName: string): boolean {
    return this.compiledTemplates.has(templateName);
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.compiledTemplates.keys());
  }

  reloadTemplates(): void {
    this.compiledTemplates.clear();
    this.loadTemplates();
  }
}
