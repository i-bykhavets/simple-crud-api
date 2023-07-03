export const isValidJSON = (jsonDate: string) => {
    try {
        JSON.parse(jsonDate);
        return true;
    } catch (error) {
        return false;
    }
}
