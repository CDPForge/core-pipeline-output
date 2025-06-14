import express from 'express';

export default class RestEP {
    app: express.Express;
    constructor(cb: (body: { inputTopic: string, outputTopic: string | null }) => Promise<void>) {
        this.app = express();
        this.app.use(express.json());

        // === HTTP Endpoint ===
        this.app.post('/topics', async (req: express.Request, res: express.Response) => {
            await cb(req.body)
            console.log('Received topic update:', req.body);
            res.sendStatus(200);
        });
    }

    start() {
        this.app.listen(3000, () => {
            console.log('HTTP server running on port 3000');
        });
    }
}
