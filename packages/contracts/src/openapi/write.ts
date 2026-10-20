import fs from 'fs';
import path from 'path';
import { createOpenApiDocument } from './document';

const target = path.resolve(__dirname, '../openapi.json');
fs.writeFileSync(target, `${JSON.stringify(createOpenApiDocument(), null, 2)}\n`);
process.stdout.write(`OpenAPI document written to ${path.relative(process.cwd(), target)}\n`);
