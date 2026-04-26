const SCRIPT_NAME = typeof GM_info === "undefined"
    ? "TL-GroupTravel Userscript"
    : (GM_info.script?.name ?? "TL-GroupTravel Userscript");
const ROOT_ATTRIBUTE = "data-tl-grouptravel-userscript-root";
const BADGE_ID = "tl-grouptravel-userscript-badge";
const STYLE_ID = "tl-grouptravel-userscript-style";
const ANNUAL_PANEL_ID = "tl-grouptravel-annual-csv-panel";
const ANNUAL_STATUS_ID = "tl-grouptravel-annual-csv-status";
const ANNUAL_PROGRESS_ID = "tl-grouptravel-annual-csv-progress";
const STATS_FORM_ID = "gscsc4000form";
const CSV_ACTION_PATH = "/accomodation/Gscsc4010CsvOutAction.do";

const CSV_HEADER = [
    "販売先名",
    "取扱個所名",
    "実績件数",
    "実績件数（比較期間）",
    "CXL件数",
    "CXL件数（比較期間）",
    "催行率",
    "催行率（比較期間）",
    "仮予約時点室数",
    "仮予約時点室数（比較期間）",
    "目減り室数",
    "目減り室数（比較期間）",
    "Wash率",
    "Wash率（比較期間）",
    "実績室数",
    "実績室数（比較期間）",
    "延人数",
    "延人数（比較期間）",
    "室料金合計",
    "室料金合計（比較期間）",
    "宿泊料金合計",
    "宿泊料金合計（比較期間）",
    "総合計料金",
    "総合計料金（比較期間）"
] as const;

const SUM_COLUMNS = [
    "実績件数",
    "実績件数（比較期間）",
    "CXL件数",
    "CXL件数（比較期間）",
    "仮予約時点室数",
    "仮予約時点室数（比較期間）",
    "目減り室数",
    "目減り室数（比較期間）",
    "実績室数",
    "実績室数（比較期間）",
    "延人数",
    "延人数（比較期間）",
    "室料金合計",
    "室料金合計（比較期間）",
    "宿泊料金合計",
    "宿泊料金合計（比較期間）",
    "総合計料金",
    "総合計料金（比較期間）"
] as const;

type CsvHeader = (typeof CSV_HEADER)[number];
type SumColumn = (typeof SUM_COLUMNS)[number];

type DateParts = {
    year: number;
    month: number;
    day: number;
};

type AnnualChunk = {
    index: number;
    collectFrom: DateParts;
    collectTo: DateParts;
    compareFrom: DateParts;
    compareTo: DateParts;
};

type ParsedCsv = {
    conditionLine: string;
    rows: Array<Record<CsvHeader, string>>;
};

type AggregatedRow = {
    salesDestinationName: string;
    handlingLocationName: string;
    values: Record<SumColumn, number>;
};

type AnnualPanelElements = {
    button: HTMLButtonElement;
    yearSelect: HTMLSelectElement;
    includeZeroCheckbox: HTMLInputElement;
    status: HTMLDivElement;
    progress: HTMLUListElement;
};

initialize();

function initialize(): void {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            boot();
        }, { once: true });
        return;
    }

    boot();
}

function boot(): void {
    if (document.documentElement.hasAttribute(ROOT_ATTRIBUTE)) {
        return;
    }

    document.documentElement.setAttribute(ROOT_ATTRIBUTE, "1");
    injectStyle();
    renderBadge();
    mountAnnualCsvPanel();

    console.info(`[${SCRIPT_NAME}] initialized`, {
        href: window.location.href,
        dev: __DEV__
    });
}

function injectStyle(): void {
    if (document.getElementById(STYLE_ID) !== null) {
        return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${BADGE_ID} {
            position: fixed;
            right: 16px;
            bottom: 16px;
            z-index: 2147483647;
            padding: 6px 10px;
            border-radius: 9999px;
            background: rgba(15, 23, 42, 0.9);
            color: #f8fafc;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
            pointer-events: none;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.24);
        }

        #${ANNUAL_PANEL_ID} {
            margin-top: 16px;
            padding: 16px;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__title {
            margin: 0;
            color: #0f172a;
            font-size: 16px;
            font-weight: 700;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__description {
            margin: 8px 0 0;
            color: #334155;
            font-size: 13px;
            line-height: 1.6;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__controls {
            display: flex;
            flex-wrap: wrap;
            gap: 12px 16px;
            align-items: center;
            margin-top: 16px;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #0f172a;
            font-size: 13px;
            font-weight: 700;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__year,
        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__button {
            min-height: 40px;
            border-radius: 9999px;
            border: 1px solid #cbd5e1;
            font-size: 13px;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__year {
            min-width: 110px;
            padding: 0 14px;
            background: #ffffff;
            color: #0f172a;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__checkbox {
            accent-color: #0f766e;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__button {
            padding: 0 18px;
            background: #0f766e;
            border-color: #0f766e;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__button:disabled {
            cursor: wait;
            opacity: 0.7;
        }

        #${ANNUAL_STATUS_ID} {
            margin-top: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            background: #e2e8f0;
            color: #0f172a;
            font-size: 13px;
            line-height: 1.6;
        }

        #${ANNUAL_STATUS_ID}[data-tone="success"] {
            background: #dcfce7;
            color: #166534;
        }

        #${ANNUAL_STATUS_ID}[data-tone="error"] {
            background: #fee2e2;
            color: #991b1b;
        }

        #${ANNUAL_STATUS_ID}[data-tone="progress"] {
            background: #dbeafe;
            color: #1d4ed8;
        }

        #${ANNUAL_PROGRESS_ID} {
            margin: 12px 0 0;
            padding-left: 18px;
            color: #334155;
            font-size: 12px;
            line-height: 1.7;
        }

        #${ANNUAL_PROGRESS_ID} li[data-status="success"] {
            color: #166534;
        }

        #${ANNUAL_PROGRESS_ID} li[data-status="error"] {
            color: #991b1b;
        }
    `;

    document.head.append(style);
}

function renderBadge(): void {
    if (document.getElementById(BADGE_ID) !== null) {
        return;
    }

    const badge = document.createElement("div");
    badge.id = BADGE_ID;
    badge.textContent = __DEV__
        ? "TL-GroupTravel userscript dev"
        : "TL-GroupTravel userscript ready";

    document.body.append(badge);
}

function mountAnnualCsvPanel(): void {
    const form = getStatsForm();
    const outputList = findOutputNavigationList();

    if (form === null || outputList === null || document.getElementById(ANNUAL_PANEL_ID) !== null) {
        return;
    }

    const panel = document.createElement("section");
    panel.id = ANNUAL_PANEL_ID;

    const title = document.createElement("h3");
    title.className = "tlgt-annual-panel__title";
    title.textContent = "年間集計 CSV";

    const description = document.createElement("p");
    description.className = "tlgt-annual-panel__description";
    description.textContent = "現在の販売先条件をそのまま使い、3か月単位の CSV を順に取得して年間集計した CSV を出力します。";

    const controls = document.createElement("div");
    controls.className = "tlgt-annual-panel__controls";

    const yearLabel = document.createElement("label");
    yearLabel.className = "tlgt-annual-panel__label";
    yearLabel.textContent = "対象年";

    const yearSelect = document.createElement("select");
    yearSelect.className = "tlgt-annual-panel__year";
    yearSelect.setAttribute("aria-label", "年間集計の対象年");
    populateYearSelect(yearSelect, form);
    yearLabel.append(yearSelect);

    const zeroLabel = document.createElement("label");
    zeroLabel.className = "tlgt-annual-panel__label";

    const includeZeroCheckbox = document.createElement("input");
    includeZeroCheckbox.className = "tlgt-annual-panel__checkbox";
    includeZeroCheckbox.type = "checkbox";
    includeZeroCheckbox.checked = false;
    zeroLabel.append(includeZeroCheckbox, "実績 0 行も含める");

    const runButton = document.createElement("button");
    runButton.className = "tlgt-annual-panel__button";
    runButton.type = "button";
    runButton.textContent = "年間 CSV を出力";

    const status = document.createElement("div");
    status.id = ANNUAL_STATUS_ID;
    status.dataset.tone = "idle";
    status.textContent = "準備完了。対象年を選んで実行してください。";

    const progress = document.createElement("ul");
    progress.id = ANNUAL_PROGRESS_ID;

    controls.append(yearLabel, zeroLabel, runButton);
    panel.append(title, description, controls, status, progress);
    outputList.insertAdjacentElement("afterend", panel);

    const elements: AnnualPanelElements = {
        button: runButton,
        yearSelect,
        includeZeroCheckbox,
        status,
        progress
    };

    runButton.addEventListener("click", () => {
        void runAnnualCsvExport(form, elements);
    });
}

async function runAnnualCsvExport(form: HTMLFormElement, elements: AnnualPanelElements): Promise<void> {
    const validationMessage = validateAnnualCsvInputs(form, elements.yearSelect.value);

    if (validationMessage !== null) {
        setPanelStatus(elements.status, validationMessage, "error");
        clearProgress(elements.progress);
        return;
    }

    const targetYear = Number.parseInt(elements.yearSelect.value, 10);
    const chunks = buildAnnualChunks(targetYear);
    const parsedCsvList: ParsedCsv[] = [];

    elements.button.disabled = true;
    clearProgress(elements.progress);
    setPanelStatus(elements.status, `${targetYear}年分の CSV 取得を開始します。`, "progress");

    try {
        for (const chunk of chunks) {
            const chunkItem = appendProgressItem(elements.progress, describeChunk(chunk));
            chunkItem.dataset.status = "progress";
            chunkItem.textContent = `${describeChunk(chunk)} を取得中...`;

            const csvText = await fetchChunkCsv(form, chunk);
            const parsedCsv = parseCsv(csvText);

            parsedCsvList.push(parsedCsv);
            chunkItem.dataset.status = "success";
            chunkItem.textContent = `${describeChunk(chunk)} を取得しました`;
        }

        const aggregatedRows = aggregateCsvRows(parsedCsvList, elements.includeZeroCheckbox.checked);
        const sortedRows = sortAggregatedRows(aggregatedRows, form);
        const csvText = buildAnnualCsvText(targetYear, form, sortedRows);

        downloadCsvFile(`統計データ_年間_${targetYear}.csv`, csvText);

        setPanelStatus(
            elements.status,
            `${targetYear}年分の年間集計 CSV を出力しました。${sortedRows.length} 行を含みます。`,
            "success"
        );
    } catch (error) {
        setPanelStatus(elements.status, toErrorMessage(error), "error");
    } finally {
        elements.button.disabled = false;
    }
}

function validateAnnualCsvInputs(form: HTMLFormElement, yearValue: string): string | null {
    if (yearValue.trim() === "") {
        return "対象年を選択してください。";
    }

    const categorySelect = getCheckedInputValue(form, "categorySelect");

    if (categorySelect !== "1") {
        return "年間集計は「販売先単位」のときだけ実行できます。";
    }

    const categoryCheckbox = form.querySelector<HTMLInputElement>('input[name="categoryCheckBox"]');

    if (categoryCheckbox?.checked !== true) {
        return "年間集計は「取扱個所まで集計単位に含める」を有効にしてください。";
    }

    return null;
}

function fetchChunkCsv(form: HTMLFormElement, chunk: AnnualChunk): Promise<string> {
    const params = serializeStatsForm(form, chunk);

    return fetch(CSV_ACTION_PATH, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: params.toString()
    }).then(async (response) => {
        const responseText = await response.text();
        const contentDisposition = response.headers.get("content-disposition") ?? "";
        const contentType = response.headers.get("content-type") ?? "";

        if (!response.ok) {
            throw new Error(`CSV 取得に失敗しました。HTTP ${response.status}`);
        }

        if (contentDisposition.includes("attachment") || contentType.includes("application/octet-stream")) {
            return responseText;
        }

        throw new Error(extractHtmlError(responseText) ?? `${describeChunk(chunk)} の取得に失敗しました。`);
    });
}

function serializeStatsForm(form: HTMLFormElement, chunk: AnnualChunk): URLSearchParams {
    const params = new URLSearchParams();

    for (const element of Array.from(form.elements)) {
        if (
            !(element instanceof HTMLInputElement)
            && !(element instanceof HTMLSelectElement)
            && !(element instanceof HTMLTextAreaElement)
        ) {
            continue;
        }

        if (element.name === "" || element.disabled) {
            continue;
        }

        if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio") && !element.checked) {
            continue;
        }

        if (element instanceof HTMLSelectElement && element.multiple) {
            for (const selectedOption of Array.from(element.selectedOptions)) {
                params.append(element.name, selectedOption.value);
            }

            continue;
        }

        params.append(element.name, element.value);
    }

    setChunkDateParams(params, "collectDateFrom", chunk.collectFrom);
    setChunkDateParams(params, "collectDateTo", chunk.collectTo);
    setChunkDateParams(params, "compareDateFrom", chunk.compareFrom);
    setChunkDateParams(params, "compareDateTo", chunk.compareTo);

    return params;
}

function setChunkDateParams(params: URLSearchParams, prefix: string, dateParts: DateParts): void {
    params.set(`${prefix}Year`, String(dateParts.year));
    params.set(`${prefix}Month`, pad2(dateParts.month));
    params.set(`${prefix}Day`, pad2(dateParts.day));
    params.set(`${prefix}_init_month`, pad2(dateParts.month));
    params.set(`${prefix}_init_day`, pad2(dateParts.day));
}

function parseCsv(csvText: string): ParsedCsv {
    const normalizedText = csvText.replace(/^\uFEFF/, "").trim();
    const lines = normalizedText.split(/\r?\n/).filter((line) => line !== "");

    if (lines.length < 2) {
        throw new Error("CSV の列構成を読み取れませんでした。");
    }

    const [conditionSourceLine, headerSourceLine] = lines as [string, string, ...string[]];
    const conditionLine = parseCsvLine(conditionSourceLine)[0] ?? "";
    const header = parseCsvLine(headerSourceLine);
    const rows = lines.slice(2).map((line) => {
        const values = parseCsvLine(line);
        const row = {} as Record<CsvHeader, string>;

        for (const column of CSV_HEADER) {
            const columnIndex = header.indexOf(column);
            row[column] = columnIndex >= 0 ? (values[columnIndex] ?? "") : "";
        }

        return row;
    });

    return { conditionLine, rows };
}

function parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const currentChar = line[index];
        const nextChar = line[index + 1];

        if (currentChar === '"') {
            if (inQuotes && nextChar === '"') {
                currentValue += '"';
                index += 1;
                continue;
            }

            inQuotes = !inQuotes;
            continue;
        }

        if (currentChar === "," && !inQuotes) {
            values.push(currentValue);
            currentValue = "";
            continue;
        }

        currentValue += currentChar;
    }

    values.push(currentValue);
    return values;
}

function aggregateCsvRows(parsedCsvList: ParsedCsv[], includeZeroRows: boolean): AggregatedRow[] {
    const aggregationMap = new Map<string, AggregatedRow>();

    for (const parsedCsv of parsedCsvList) {
        for (const row of parsedCsv.rows) {
            const salesDestinationName = row["販売先名"];
            const handlingLocationName = row["取扱個所名"];
            const key = `${salesDestinationName}\u0000${handlingLocationName}`;
            const existingRow = aggregationMap.get(key) ?? createEmptyAggregatedRow(salesDestinationName, handlingLocationName);

            for (const column of SUM_COLUMNS) {
                existingRow.values[column] += parseCsvNumber(row[column]);
            }

            aggregationMap.set(key, existingRow);
        }
    }

    return Array.from(aggregationMap.values()).filter((row) => includeZeroRows || !isZeroResultRow(row));
}

function createEmptyAggregatedRow(salesDestinationName: string, handlingLocationName: string): AggregatedRow {
    return {
        salesDestinationName,
        handlingLocationName,
        values: Object.fromEntries(
            SUM_COLUMNS.map((column) => [column, 0])
        ) as Record<SumColumn, number>
    };
}

function isZeroResultRow(row: AggregatedRow): boolean {
    return row.values["実績件数"] === 0
        && row.values["実績室数"] === 0
        && row.values["延人数"] === 0
        && row.values["総合計料金"] === 0;
}

function sortAggregatedRows(rows: AggregatedRow[], form: HTMLFormElement): AggregatedRow[] {
    const sortMode = getCheckedInputValue(form, "sortItemRadio");
    const sortedRows = [...rows];

    sortedRows.sort((leftRow, rightRow) => {
        const primaryDiff = getSortValue(rightRow, sortMode) - getSortValue(leftRow, sortMode);

        if (primaryDiff !== 0) {
            return primaryDiff;
        }

        const feeDiff = rightRow.values["総合計料金"] - leftRow.values["総合計料金"];

        if (feeDiff !== 0) {
            return feeDiff;
        }

        return `${leftRow.salesDestinationName}${leftRow.handlingLocationName}`.localeCompare(
            `${rightRow.salesDestinationName}${rightRow.handlingLocationName}`,
            "ja"
        );
    });

    return sortedRows;
}

function getSortValue(row: AggregatedRow, sortMode: string | null): number {
    if (sortMode === "2") {
        return calculateRate(row.values["目減り室数"], row.values["仮予約時点室数"]);
    }

    if (sortMode === "1") {
        return calculateRate(row.values["実績件数"], row.values["実績件数"] + row.values["CXL件数"]);
    }

    return row.values["総合計料金"];
}

function buildAnnualCsvText(targetYear: number, form: HTMLFormElement, rows: AggregatedRow[]): string {
    const compareYear = targetYear - 1;
    const lines: string[] = [];

    lines.push(toCsvLine([buildConditionLine(targetYear, compareYear, form)]));
    lines.push(toCsvLine([...CSV_HEADER]));

    for (const row of rows) {
        lines.push(toCsvLine([
            row.salesDestinationName,
            row.handlingLocationName,
            formatInteger(row.values["実績件数"]),
            formatInteger(row.values["実績件数（比較期間）"]),
            formatInteger(row.values["CXL件数"]),
            formatInteger(row.values["CXL件数（比較期間）"]),
            formatPercentage(calculateRate(row.values["実績件数"], row.values["実績件数"] + row.values["CXL件数"])),
            formatPercentage(calculateRate(row.values["実績件数（比較期間）"], row.values["実績件数（比較期間）"] + row.values["CXL件数（比較期間）"])),
            formatInteger(row.values["仮予約時点室数"]),
            formatInteger(row.values["仮予約時点室数（比較期間）"]),
            formatInteger(row.values["目減り室数"]),
            formatInteger(row.values["目減り室数（比較期間）"]),
            formatPercentage(calculateRate(row.values["目減り室数"], row.values["仮予約時点室数"])),
            formatPercentage(calculateRate(row.values["目減り室数（比較期間）"], row.values["仮予約時点室数（比較期間）"])),
            formatInteger(row.values["実績室数"]),
            formatInteger(row.values["実績室数（比較期間）"]),
            formatInteger(row.values["延人数"]),
            formatInteger(row.values["延人数（比較期間）"]),
            formatInteger(row.values["室料金合計"]),
            formatInteger(row.values["室料金合計（比較期間）"]),
            formatInteger(row.values["宿泊料金合計"]),
            formatInteger(row.values["宿泊料金合計（比較期間）"]),
            formatInteger(row.values["総合計料金"]),
            formatInteger(row.values["総合計料金（比較期間）"])
        ]));
    }

    return `\uFEFF${lines.join("\r\n")}`;
}

function buildConditionLine(targetYear: number, compareYear: number, form: HTMLFormElement): string {
    return `抽出条件(集計期間：${targetYear}/01/01 ～ ${targetYear}/12/31、比較期間：${compareYear}/01/01 ～ ${compareYear}/12/31、集計単位：取扱個所、販売先：${summarizeSelection(form, "salesDestSelectCd", "salesDestSelectAll")}、団体種別：${summarizeSelection(form, "itemMstListCd", "itemMstListAll")}、並び順：${describeSortMode(form)})`;
}

function summarizeSelection(form: HTMLFormElement, itemName: string, allName: string): string {
    const allInput = form.querySelector<HTMLInputElement>(`input[name="${allName}"]`);

    if (allInput?.checked === true) {
        return "すべて";
    }

    const selectedInputs = Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${itemName}"]:checked`));

    return selectedInputs.length === 0 ? "なし" : `${selectedInputs.length}件選択`;
}

function describeSortMode(form: HTMLFormElement): string {
    const sortMode = getCheckedInputValue(form, "sortItemRadio");

    if (sortMode === "2") {
        return "Wash率";
    }

    if (sortMode === "1") {
        return "催行率";
    }

    const sortSelect = form.querySelector<HTMLSelectElement>('select[name="sortItemList"]');

    return sortSelect?.selectedOptions[0]?.textContent?.trim() || "その他";
}

function downloadCsvFile(fileName: string, text: string): void {
    const blob = new Blob([text], { type: "text/csv;charset=UTF-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
    }, 0);
}

function populateYearSelect(selectElement: HTMLSelectElement, form: HTMLFormElement): void {
    const sourceSelect = form.querySelector<HTMLSelectElement>('select[name="collectDateFromYear"]');
    const selectedYear = sourceSelect?.value || String(new Date().getFullYear());

    for (const optionElement of Array.from(sourceSelect?.options ?? [])) {
        if (optionElement.value === "") {
            continue;
        }

        const option = document.createElement("option");
        option.value = optionElement.value;
        option.textContent = optionElement.textContent ?? optionElement.value;
        option.selected = optionElement.value === selectedYear;
        selectElement.append(option);
    }
}

function buildAnnualChunks(targetYear: number): AnnualChunk[] {
    return [0, 1, 2, 3].map((quarterIndex) => {
        const startMonth = quarterIndex * 3 + 1;
        const endMonth = startMonth + 2;

        return {
            index: quarterIndex + 1,
            collectFrom: { year: targetYear, month: startMonth, day: 1 },
            collectTo: { year: targetYear, month: endMonth, day: getLastDayOfMonth(targetYear, endMonth) },
            compareFrom: { year: targetYear - 1, month: startMonth, day: 1 },
            compareTo: { year: targetYear - 1, month: endMonth, day: getLastDayOfMonth(targetYear - 1, endMonth) }
        };
    });
}

function describeChunk(chunk: AnnualChunk): string {
    return `${chunk.collectFrom.year}/${pad2(chunk.collectFrom.month)}/${pad2(chunk.collectFrom.day)}～${chunk.collectTo.year}/${pad2(chunk.collectTo.month)}/${pad2(chunk.collectTo.day)}`;
}

function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function getStatsForm(): HTMLFormElement | null {
    return document.getElementById(STATS_FORM_ID) as HTMLFormElement | null;
}

function findOutputNavigationList(): HTMLUListElement | null {
    const csvLink = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((anchor) => {
        return (anchor.textContent || "").includes("CSVに出力する");
    });

    return csvLink?.closest("ul") as HTMLUListElement | null;
}

function getCheckedInputValue(form: HTMLFormElement, name: string): string | null {
    const checkedInput = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
    return checkedInput?.value ?? null;
}

function extractHtmlError(htmlText: string): string | null {
    const documentParser = new DOMParser();
    const htmlDocument = documentParser.parseFromString(htmlText, "text/html");
    const warningMessages = Array.from(htmlDocument.querySelectorAll(".c_txt-worning, .c_message span, .c_message"))
        .map((element) => element.textContent?.trim() ?? "")
        .filter((message) => message !== "");

    if (warningMessages.length > 0) {
        return warningMessages.join(" ");
    }

    return htmlDocument.body.textContent?.replace(/\s+/g, " ").trim() || null;
}

function parseCsvNumber(value: string): number {
    const normalizedValue = value.replaceAll(",", "").replaceAll("%", "").trim();

    if (normalizedValue === "") {
        return 0;
    }

    const parsedNumber = Number.parseFloat(normalizedValue);
    return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
}

function calculateRate(numerator: number, denominator: number): number {
    if (denominator === 0) {
        return 0;
    }

    return numerator / denominator;
}

function formatPercentage(value: number): string {
    return `${Math.round(value * 100)}%`;
}

function formatInteger(value: number): string {
    return Math.round(value).toLocaleString("en-US");
}

function toCsvLine(values: string[]): string {
    return values.map((value) => `"${value.replaceAll('"', '""')}"`).join(",");
}

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}

function setPanelStatus(statusElement: HTMLDivElement, message: string, tone: "idle" | "progress" | "success" | "error"): void {
    statusElement.dataset.tone = tone;
    statusElement.textContent = message;
}

function clearProgress(progressElement: HTMLUListElement): void {
    progressElement.replaceChildren();
}

function appendProgressItem(progressElement: HTMLUListElement, text: string): HTMLLIElement {
    const item = document.createElement("li");
    item.textContent = text;
    progressElement.append(item);
    return item;
}

function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "年間集計 CSV の作成に失敗しました。";
}
