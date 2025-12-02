import crypto from "node:crypto";

/**
 * Signs a request to the Rauk Inventory API
 * @param apiKeyId - The API key ID
 * @param apiSecret - The API secret
 * @param apiPublicKey - The API public key
 * @param body - The body of the request
 * @returns The signed request
 */
export const signRequest = (
	{
		apiKeyId,
		apiSecret,
		apiPublicKey,
	}: {
		apiKeyId: string;
		apiSecret: string;
		apiPublicKey: string;
	},
	body: object,
) => {
	const time = Date.now().toString();
	const data = JSON.stringify(body) + time;

	try {
		const hmac = crypto
			.createHmac("sha256", apiSecret)
			.update(data)
			.digest("hex");
		const b64Time = Buffer.from(time).toString("base64");
		return `${apiKeyId}.${apiPublicKey}.${hmac}.${b64Time}`;
	} catch (e) {
		console.error(e);
		throw new Error("Failed to generate signature");
	}
};
