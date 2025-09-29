const domain = "localhost:8000";

export const getProjectUrl = (projectName : string) => {
    let url = `http://${projectName}.${domain}`;
    return url;
}