export async function wrapSafe<T>(task: Promise<T>) {
	try {
		return await task;
	} catch {
		return undefined;
	}
}
