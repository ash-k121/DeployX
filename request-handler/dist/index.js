"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get('*', (req, res) => {
    const host = req.hostname;
    console.log('Full hostname:', host);
    // Handle case where host doesn't have dots
    const parts = host.split('.');
    if (parts.length > 1) {
        const id = parts[0];
        console.log('ID:', id);
        res.send(`ID: ${id}`);
    }
    else {
        console.log('No subdomain found');
        res.status(400).send('No subdomain found in hostname');
    }
});
app.listen(3001, () => {
    console.log('Server running on port 3001');
});
