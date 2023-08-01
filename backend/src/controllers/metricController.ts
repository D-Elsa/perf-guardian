import { Request, Response } from "express";
import { runSimulationForDomains } from "../simulation-workers/simulationsHub";
import Dataset from "../models/Dataset";
import Domain from "../models/Domain";
import Client from "../models/Client";
import { handleControllerErrors } from "../utils/handleControllerErrors";

export const createMetric = async (req: Request, res: Response): Promise<Response> => {
    try {
        // TODO : change this by id instead of url to match client at the same time
        const { url } = req.body as { url: string | undefined };
        if (!url || typeof url !== "string") throw new Error("wrong url param");

        // TODO : find by url and client id when we can access it in token
        const domain = await Domain.findOne({ url });
        if (!domain) throw new Error("no domain found");

        const metrics = await runSimulationForDomains([domain]);
        const dataset = await Dataset.create({
            date: new Date(),
            ...metrics[0].data,
        });

        await Domain.updateOne({_id: domain.id}, {
            datasets: [...domain.datasets, dataset.id],
        });

        return res.status(200).json({ msg: "metrics creation sucessfull", metrics });
    } catch (err) { return handleControllerErrors(err, res, "something went wrong in metrics creation");}
};

export const getMetrics = async (req: Request, res: Response): Promise<Response> => {
    try {
        // TODO : use token instead to get clientId to make sure user has only access to his own resources
        const { domainId, clientId } = req.query as { domainId: string | undefined, clientId: string | undefined };
        if (!domainId || typeof domainId !== "string") throw new Error("domainId must be a string");
        if(!clientId || typeof clientId !== "string") throw new Error("clientId must be a string");

        const domain = await Domain.findOne({_id: domainId }).populate("datasets");
        if(!domain) throw new Error(`could not find domain ${domainId} for client ${clientId}`);

        const client = await Client.findOne({_id: clientId });
        if (!client?.domains.find((domain) => domain.toString() === domainId))
            throw new Error("cannot access this resource");

        return res.status(200).json({ metrics: domain.datasets });
    } catch (err) { return handleControllerErrors(err, res, "metrics could not be retrieved");}
};
