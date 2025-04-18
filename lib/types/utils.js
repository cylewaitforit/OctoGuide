export async function wrapSafe(task) {
    try {
        return await task;
    }
    catch {
        return undefined;
    }
}
