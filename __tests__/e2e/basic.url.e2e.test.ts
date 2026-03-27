import request  from "supertest";
import { setupApp } from "../../src/setup-app";
import express from "express";

describe('GET /', () => {

    const app = express();
    setupApp(app);

    it("should return 'Hello world!'", async () => {

        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Hello users!')
    })
});


