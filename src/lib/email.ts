import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private from: string;
    private to: string;

    constructor() {
        this.from = process.env.EMAIL_FROM || '';
        this.to   = process.env.EMAIL_TO   || '';
        const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASS: pass } = process.env;
        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({ host, port: parseInt(port||'587'), secure: port==='465', auth: { user, pass } });
            console.log(`Email configured: ${user}@${host}`);
        } else { console.warn('SMTP not configured — email disabled.'); }
    }

    async sendReviewReminder(date: string, itemCount: number) {
        if (!this.transporter) return;
        const url = `http://localhost:4242?date=${date}`;
        const html = `<div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#0f0f0f;color:#e8e8e8;padding:40px;border-radius:6px">
          <div style="font-family:monospace;font-size:11px;color:#f0c040;letter-spacing:.1em;text-transform:uppercase;margin-bottom:24px">⬡ Nightly Librarian</div>
          <h1 style="font-size:22px;font-weight:300;margin:0 0 8px">Review inbox for ${date}</h1>
          <p style="font-size:14px;color:#888;margin:0 0 32px;font-family:monospace">${itemCount} item${itemCount!==1?'s':''} · pipeline runs at 02:00</p>
          <a href="${url}" style="display:inline-block;background:#f0c040;color:#000;font-family:monospace;font-size:13px;font-weight:600;padding:14px 28px;border-radius:4px;text-decoration:none;text-transform:uppercase">Open Review UI →</a>
          <p style="font-size:12px;color:#555;margin-top:32px;font-family:monospace;line-height:1.6">Unreviewed items will be <span style="color:#f0c040">flagged</span>. Rejected items are dropped.</p>
        </div>`;
        try {
            await this.transporter.sendMail({ from: `"Nightly Librarian" <${this.from}>`, to: this.to, subject: `📬 Review inbox for ${date} — ${itemCount} item${itemCount!==1?'s':''}`, html });
            console.log(`Review reminder sent to ${this.to}`);
        } catch (e) { console.error('Review reminder failed:', e); }
    }

    async sendMorningBrief(date: string, brief: any) {
        if (!this.transporter) return;
        const html = `<h1>Morning Brief: ${date}</h1>
          <h2>Promotions</h2><ul>${brief.promotions?.map((p:any)=>`<li><b>${p.title}</b>: ${p.why_promoted}</li>`).join('')||'None'}</ul>
          <h2>Themes</h2><ul>${brief.themes?.map((t:any)=>`<li><b>${t.theme}</b>: ${t.evidence}</li>`).join('')||'None'}</ul>
          <h2>Top Next Moves</h2><ul>${brief.top_next_moves?.map((m:any)=>`<li>${m}</li>`).join('')||'None'}</ul>`;
        try {
            await this.transporter.sendMail({ from: `"Nightly Librarian" <${this.from}>`, to: this.to, subject: `Morning Brief: ${date}`, html });
            console.log(`Morning brief sent to ${this.to}`);
        } catch (e) { console.error('Morning brief failed:', e); }
    }
}
