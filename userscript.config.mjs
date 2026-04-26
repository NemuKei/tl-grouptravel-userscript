import packageJson from "./package.json" with { type: "json" };

const githubPagesBaseUrl = process.env.GITHUB_PAGES_BASE_URL?.trim();
const githubRunNumber = process.env.GITHUB_RUN_NUMBER?.trim();
const publishedUserscriptUrl = githubPagesBaseUrl
    ? `${githubPagesBaseUrl.replace(/\/$/, "")}/tl-grouptravel-userscript.user.js`
    : undefined;
const publishedVersion = githubRunNumber
    ? `${packageJson.version}.${githubRunNumber}`
    : packageJson.version;

export default {
    id: "tl-grouptravel-userscript",
    name: "TL-GroupTravel Userscript",
    namespace: githubPagesBaseUrl ?? "https://local.tl-grouptravel.dev/userscript/",
    version: publishedVersion,
    description: "TL-GroupTravel 向け userscript 開発基盤",
    author: "TL-GroupTravel Userscript Workspace",
    match: [
        "https://example.com/*"
    ],
    updateURL: publishedUserscriptUrl,
    downloadURL: publishedUserscriptUrl,
    grant: ["none"],
    runAt: "document-idle"
};
