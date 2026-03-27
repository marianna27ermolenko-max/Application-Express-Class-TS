import request  from "supertest";
import { setupApp } from "../../src/setup-app";
import express from "express";
import { HttpStatus } from "../../src/common/types/http.status";



describe('AUTH_TEST', () => {
    const app = express();
    setupApp(app);

    beforeAll(async () => {
            await request(app).delete("/all-data");
        });

    it('')    
})