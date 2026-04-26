const SCRIPT_NAME = typeof GM_info === "undefined"
    ? "TL-GroupTravel Userscript"
    : (GM_info.script?.name ?? "TL-GroupTravel Userscript");
const ROOT_ATTRIBUTE = "data-tl-grouptravel-userscript-root";
const BADGE_ID = "tl-grouptravel-userscript-badge";
const STYLE_ID = "tl-grouptravel-userscript-style";
const ANNUAL_PANEL_ID = "tl-grouptravel-annual-csv-panel";
const ANNUAL_STATUS_ID = "tl-grouptravel-annual-csv-status";
const ANNUAL_PROGRESS_ID = "tl-grouptravel-annual-csv-progress";
const ANNUAL_RESULT_ID = "tl-grouptravel-annual-csv-result";
const ANNUAL_CHART_ID = "tl-grouptravel-annual-csv-chart";
const ANNUAL_TABLE_ID = "tl-grouptravel-annual-csv-table";
const STATS_FORM_ID = "gscsc4000form";
const CSV_ACTION_PATH = "/accomodation/Gscsc4010CsvOutAction.do";
const PIE_CHART_COLORS = ["#0f766e", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#94a3b8"] as const;

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

type MonthRangeSelection = {
    startYear: number;
    endYear: number;
    fromMonth: number;
    toMonth: number;
};

type AnnualRunMode = "display" | "csv";

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
    displayButton: HTMLButtonElement;
    exportButton: HTMLButtonElement;
    recentButton: HTMLButtonElement;
    fiscalButton: HTMLButtonElement;
    startYearSelect: HTMLSelectElement;
    endYearSelect: HTMLSelectElement;
    fromMonthSelect: HTMLSelectElement;
    toMonthSelect: HTMLSelectElement;
    includeZeroCheckbox: HTMLInputElement;
    periodPreview: HTMLDivElement;
    status: HTMLDivElement;
    progress: HTMLUListElement;
    result: HTMLDivElement;
    chart: HTMLDivElement;
    table: HTMLDivElement;
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
        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__month,
        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__button {
            min-height: 40px;
            border-radius: 9999px;
            border: 1px solid #cbd5e1;
            font-size: 13px;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__year,
        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__month {
            padding: 0 14px;
            background: #ffffff;
            color: #0f172a;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__year {
            min-width: 110px;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__month {
            min-width: 88px;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__range {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__checkbox {
            accent-color: #0f766e;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__shortcut-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__shortcut {
            min-height: 34px;
            padding: 0 12px;
            border-radius: 9999px;
            border: 1px solid #94a3b8;
            background: #ffffff;
            color: #0f172a;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        #${ANNUAL_PANEL_ID} .tlgt-annual-panel__preview {
            margin-top: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            background: #f8fafc;
            border: 1px solid #dbeafe;
            color: #334155;
            font-size: 12px;
            line-height: 1.7;
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

        #${ANNUAL_RESULT_ID} {
            margin-top: 16px;
            display: none;
            gap: 16px;
        }

        #${ANNUAL_RESULT_ID}[data-visible="true"] {
            display: grid;
        }

        #${ANNUAL_RESULT_ID} .tlgt-annual-panel__summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
        }

        #${ANNUAL_RESULT_ID} .tlgt-annual-panel__summary-card {
            padding: 14px;
            border-radius: 12px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
        }

        #${ANNUAL_RESULT_ID} .tlgt-annual-panel__summary-label {
            color: #475569;
            font-size: 12px;
        }

        #${ANNUAL_RESULT_ID} .tlgt-annual-panel__summary-value {
            margin-top: 6px;
            color: #0f172a;
            font-size: 22px;
            font-weight: 700;
        }

        #${ANNUAL_CHART_ID} {
            display: grid;
            gap: 10px;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-title,
        #${ANNUAL_TABLE_ID} .tlgt-annual-panel__table-title {
            margin: 0;
            color: #0f172a;
            font-size: 14px;
            font-weight: 700;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-layout {
            display: grid;
            grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
            gap: 16px;
            align-items: start;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__pie-wrap {
            position: relative;
            width: min(240px, 100%);
            aspect-ratio: 1;
            margin: 0 auto;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__pie {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1px solid #dbeafe;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__pie-center {
            position: absolute;
            inset: 50% auto auto 50%;
            transform: translate(-50%, -50%);
            width: 54%;
            height: 54%;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.96);
            display: grid;
            place-items: center;
            text-align: center;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__pie-total-label {
            color: #64748b;
            font-size: 11px;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__pie-total-value {
            margin-top: 6px;
            color: #0f172a;
            font-size: 18px;
            font-weight: 700;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-legend {
            display: grid;
            gap: 10px;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-legend-item {
            display: grid;
            grid-template-columns: 12px minmax(0, 1fr) auto;
            gap: 10px;
            align-items: center;
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-color {
            width: 12px;
            height: 12px;
            border-radius: 9999px;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-label-wrap {
            min-width: 0;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-label,
        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-meta {
            font-size: 12px;
            color: #334155;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-meta {
            margin-top: 4px;
            color: #64748b;
        }

        #${ANNUAL_CHART_ID} .tlgt-annual-panel__chart-value {
            color: #0f172a;
            font-size: 12px;
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
        }

        #${ANNUAL_TABLE_ID} {
            overflow-x: auto;
        }

        #${ANNUAL_TABLE_ID} table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
        }

        #${ANNUAL_TABLE_ID} th,
        #${ANNUAL_TABLE_ID} td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
            text-align: left;
            white-space: nowrap;
        }

        #${ANNUAL_TABLE_ID} th {
            position: sticky;
            top: 0;
            background: #f8fafc;
            color: #334155;
            font-weight: 700;
        }

        #${ANNUAL_TABLE_ID} td[data-align="right"] {
            text-align: right;
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
    title.textContent = "期間集計";

    const description = document.createElement("p");
    description.className = "tlgt-annual-panel__description";
    description.textContent = "現在の販売先条件をそのまま使い、3か月単位の CSV を順に取得して集計します。年またぎの範囲や前年同時期比較にも対応します。";

    const controls = document.createElement("div");
    controls.className = "tlgt-annual-panel__controls";

    const shortcutLabel = document.createElement("div");
    shortcutLabel.className = "tlgt-annual-panel__label";
    shortcutLabel.textContent = "クイック選択";

    const shortcutGroup = document.createElement("span");
    shortcutGroup.className = "tlgt-annual-panel__shortcut-group";

    const recentButton = document.createElement("button");
    recentButton.type = "button";
    recentButton.className = "tlgt-annual-panel__shortcut";
    recentButton.textContent = "直近12か月";

    const fiscalButton = document.createElement("button");
    fiscalButton.type = "button";
    fiscalButton.className = "tlgt-annual-panel__shortcut";
    fiscalButton.textContent = "年度(4月〜3月)";

    shortcutGroup.append(recentButton, fiscalButton);
    shortcutLabel.append(shortcutGroup);

    const startYearLabel = document.createElement("label");
    startYearLabel.className = "tlgt-annual-panel__label";
    startYearLabel.textContent = "開始年";

    const startYearSelect = document.createElement("select");
    startYearSelect.className = "tlgt-annual-panel__year";
    startYearSelect.setAttribute("aria-label", "期間集計の開始年");
    populateYearSelect(startYearSelect, form);
    startYearLabel.append(startYearSelect);

    const endYearLabel = document.createElement("label");
    endYearLabel.className = "tlgt-annual-panel__label";
    endYearLabel.textContent = "終了年";

    const endYearSelect = document.createElement("select");
    endYearSelect.className = "tlgt-annual-panel__year";
    endYearSelect.setAttribute("aria-label", "期間集計の終了年");
    populateYearSelect(endYearSelect, form);
    endYearLabel.append(endYearSelect);

    const rangeLabel = document.createElement("label");
    rangeLabel.className = "tlgt-annual-panel__label";
    rangeLabel.textContent = "対象月";

    const rangeWrap = document.createElement("span");
    rangeWrap.className = "tlgt-annual-panel__range";

    const fromMonthSelect = document.createElement("select");
    fromMonthSelect.className = "tlgt-annual-panel__month";
    fromMonthSelect.setAttribute("aria-label", "対象開始月");

    const toMonthSelect = document.createElement("select");
    toMonthSelect.className = "tlgt-annual-panel__month";
    toMonthSelect.setAttribute("aria-label", "対象終了月");

    populateMonthSelect(fromMonthSelect, 1);
    populateMonthSelect(toMonthSelect, 12);
    rangeWrap.append(fromMonthSelect, document.createTextNode("〜"), toMonthSelect);
    rangeLabel.append(rangeWrap);

    const zeroLabel = document.createElement("label");
    zeroLabel.className = "tlgt-annual-panel__label";

    const includeZeroCheckbox = document.createElement("input");
    includeZeroCheckbox.className = "tlgt-annual-panel__checkbox";
    includeZeroCheckbox.type = "checkbox";
    includeZeroCheckbox.checked = false;
    zeroLabel.append(includeZeroCheckbox, "実績 0 行も含める");

    const displayButton = document.createElement("button");
    displayButton.className = "tlgt-annual-panel__button";
    displayButton.type = "button";
    displayButton.textContent = "表示する";

    const exportButton = document.createElement("button");
    exportButton.className = "tlgt-annual-panel__button";
    exportButton.type = "button";
    exportButton.textContent = "CSV を出力";

    const status = document.createElement("div");
    status.id = ANNUAL_STATUS_ID;
    status.dataset.tone = "idle";
    status.textContent = "準備完了。開始年・終了年と対象月を選んで実行してください。直近12か月と年度のクイック選択も使えます。";

    const periodPreview = document.createElement("div");
    periodPreview.className = "tlgt-annual-panel__preview";

    const progress = document.createElement("ul");
    progress.id = ANNUAL_PROGRESS_ID;

    const result = document.createElement("div");
    result.id = ANNUAL_RESULT_ID;
    result.dataset.visible = "false";

    const chart = document.createElement("div");
    chart.id = ANNUAL_CHART_ID;

    const table = document.createElement("div");
    table.id = ANNUAL_TABLE_ID;

    result.append(chart, table);

    controls.append(shortcutLabel, startYearLabel, endYearLabel, rangeLabel, zeroLabel, displayButton, exportButton);
    panel.append(title, description, controls, periodPreview, status, progress, result);
    outputList.insertAdjacentElement("afterend", panel);

    const elements: AnnualPanelElements = {
        displayButton,
        exportButton,
        recentButton,
        fiscalButton,
        startYearSelect,
        endYearSelect,
        fromMonthSelect,
        toMonthSelect,
        includeZeroCheckbox,
        periodPreview,
        status,
        progress,
        result,
        chart,
        table
    };

    displayButton.addEventListener("click", () => {
        void runAnnualAggregation(form, elements, "display");
    });

    exportButton.addEventListener("click", () => {
        void runAnnualAggregation(form, elements, "csv");
    });

    recentButton.addEventListener("click", () => {
        applyRecentYearPreset(elements);
        syncPeriodPreview(elements);
    });

    fiscalButton.addEventListener("click", () => {
        applyFiscalYearPreset(elements);
        syncPeriodPreview(elements);
    });

    for (const selectElement of [startYearSelect, endYearSelect, fromMonthSelect, toMonthSelect]) {
        selectElement.addEventListener("change", () => {
            syncPeriodPreview(elements);
        });
    }

    syncPeriodPreview(elements);
}

async function runAnnualAggregation(
    form: HTMLFormElement,
    elements: AnnualPanelElements,
    mode: AnnualRunMode
): Promise<void> {
    const rangeSelection = getMonthRangeSelection(elements);
    const validationMessage = validateAnnualCsvInputs(form, rangeSelection);

    if (validationMessage !== null) {
        setPanelStatus(elements.status, validationMessage, "error");
        clearProgress(elements.progress);
        if (mode === "display") {
            clearRenderedResult(elements);
        }
        return;
    }

    const chunks = buildAnnualChunks(rangeSelection);
    const parsedCsvList: ParsedCsv[] = [];

    elements.displayButton.disabled = true;
    elements.exportButton.disabled = true;
    clearProgress(elements.progress);
    setPanelStatus(
        elements.status,
        `${describeSelection(rangeSelection)} の ${mode === "display" ? "表示用" : "CSV 出力用"}集計を開始します。`,
        "progress"
    );

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

        if (mode === "display") {
            renderAggregatedResult(elements, rangeSelection, sortedRows);
            setPanelStatus(
                elements.status,
                `${describeSelection(rangeSelection)} の集計を表示しました。${sortedRows.length} 行を含みます。`,
                "success"
            );
        } else {
            const csvText = buildAnnualCsvText(rangeSelection, form, sortedRows);
            downloadCsvFile(buildCsvFileName(rangeSelection), csvText);
            setPanelStatus(
                elements.status,
                `${describeSelection(rangeSelection)} の CSV を出力しました。${sortedRows.length} 行を含みます。`,
                "success"
            );
        }
    } catch (error) {
        setPanelStatus(elements.status, toErrorMessage(error), "error");
        if (mode === "display") {
            clearRenderedResult(elements);
        }
    } finally {
        elements.displayButton.disabled = false;
        elements.exportButton.disabled = false;
    }
}

function validateAnnualCsvInputs(form: HTMLFormElement, rangeSelection: MonthRangeSelection): string | null {
    if (Number.isNaN(rangeSelection.startYear) || Number.isNaN(rangeSelection.endYear)) {
        return "開始年と終了年を選択してください。";
    }

    const startMonthIndex = toMonthIndex(rangeSelection.startYear, rangeSelection.fromMonth);
    const endMonthIndex = toMonthIndex(rangeSelection.endYear, rangeSelection.toMonth);

    if (endMonthIndex < startMonthIndex) {
        return "対象期間は開始より前に終了しないようにしてください。";
    }

    if ((endMonthIndex - startMonthIndex) > 11) {
        return "対象期間は 12 か月以内で指定してください。";
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

function getMonthRangeSelection(elements: AnnualPanelElements): MonthRangeSelection {
    return {
        startYear: Number.parseInt(elements.startYearSelect.value, 10),
        endYear: Number.parseInt(elements.endYearSelect.value, 10),
        fromMonth: Number.parseInt(elements.fromMonthSelect.value, 10),
        toMonth: Number.parseInt(elements.toMonthSelect.value, 10)
    };
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

function buildAnnualCsvText(rangeSelection: MonthRangeSelection, form: HTMLFormElement, rows: AggregatedRow[]): string {
    const lines: string[] = [];

    lines.push(toCsvLine([buildConditionLine(rangeSelection, form)]));
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

function buildConditionLine(rangeSelection: MonthRangeSelection, form: HTMLFormElement): string {
    const period = buildRangePeriod(rangeSelection);
    const targetStart = formatDateParts(period.collectFrom);
    const targetEnd = formatDateParts(period.collectTo);
    const compareStart = formatDateParts(period.compareFrom);
    const compareEnd = formatDateParts(period.compareTo);

    return `抽出条件(集計期間：${targetStart} ～ ${targetEnd}、比較期間：${compareStart} ～ ${compareEnd}、集計単位：取扱個所、販売先：${summarizeSelection(form, "salesDestSelectCd", "salesDestSelectAll")}、団体種別：${summarizeSelection(form, "itemMstListCd", "itemMstListAll")}、並び順：${describeSortMode(form)})`;
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

function syncPeriodPreview(elements: AnnualPanelElements): void {
    const rangeSelection = getMonthRangeSelection(elements);
    const period = buildRangePeriod(rangeSelection);

    elements.periodPreview.innerHTML = [
        `対象期間: ${formatDateParts(period.collectFrom)} ～ ${formatDateParts(period.collectTo)}`,
        `比較期間: ${formatDateParts(period.compareFrom)} ～ ${formatDateParts(period.compareTo)}`
    ].join("<br>");
}

function applyRecentYearPreset(elements: AnnualPanelElements): void {
    const today = new Date();
    const endYear = today.getFullYear();
    const endMonth = today.getMonth() + 1;
    const startDate = new Date(endYear, endMonth - 12, 1);

    setRangeSelectionValues(elements, {
        startYear: startDate.getFullYear(),
        endYear,
        fromMonth: startDate.getMonth() + 1,
        toMonth: endMonth
    });
}

function applyFiscalYearPreset(elements: AnnualPanelElements): void {
    const startYear = Number.parseInt(elements.startYearSelect.value, 10);

    setRangeSelectionValues(elements, {
        startYear,
        endYear: startYear + 1,
        fromMonth: 4,
        toMonth: 3
    });
}

function setRangeSelectionValues(elements: AnnualPanelElements, rangeSelection: MonthRangeSelection): void {
    ensureYearOption(elements.startYearSelect, rangeSelection.startYear);
    ensureYearOption(elements.endYearSelect, rangeSelection.endYear);
    elements.startYearSelect.value = String(rangeSelection.startYear);
    elements.endYearSelect.value = String(rangeSelection.endYear);
    elements.fromMonthSelect.value = String(rangeSelection.fromMonth);
    elements.toMonthSelect.value = String(rangeSelection.toMonth);
}

function ensureYearOption(selectElement: HTMLSelectElement, year: number): void {
    const yearValue = String(year);

    if (Array.from(selectElement.options).some((option) => option.value === yearValue)) {
        return;
    }

    const option = document.createElement("option");
    option.value = yearValue;
    option.textContent = yearValue;
    selectElement.append(option);

    Array.from(selectElement.options)
        .sort((leftOption, rightOption) => Number.parseInt(leftOption.value, 10) - Number.parseInt(rightOption.value, 10))
        .forEach((sortedOption) => {
            selectElement.append(sortedOption);
        });
}

function populateMonthSelect(selectElement: HTMLSelectElement, selectedMonth: number): void {
    for (let month = 1; month <= 12; month += 1) {
        const option = document.createElement("option");
        option.value = String(month);
        option.textContent = `${pad2(month)}月`;
        option.selected = month === selectedMonth;
        selectElement.append(option);
    }
}

function buildAnnualChunks(rangeSelection: MonthRangeSelection): AnnualChunk[] {
    const chunks: AnnualChunk[] = [];
    const period = buildRangePeriod(rangeSelection);
    let chunkIndex = 1;
    let currentMonthIndex = toMonthIndex(period.collectFrom.year, period.collectFrom.month);
    const endMonthIndex = toMonthIndex(period.collectTo.year, period.collectTo.month);

    while (currentMonthIndex <= endMonthIndex) {
        const chunkEndMonthIndex = Math.min(currentMonthIndex + 2, endMonthIndex);
        const collectFromMonth = fromMonthIndex(currentMonthIndex);
        const collectToMonth = fromMonthIndex(chunkEndMonthIndex);
        const compareFromMonth = fromMonthIndex(currentMonthIndex - 12);
        const compareToMonth = fromMonthIndex(chunkEndMonthIndex - 12);

        chunks.push({
            index: chunkIndex,
            collectFrom: { year: collectFromMonth.year, month: collectFromMonth.month, day: 1 },
            collectTo: {
                year: collectToMonth.year,
                month: collectToMonth.month,
                day: getLastDayOfMonth(collectToMonth.year, collectToMonth.month)
            },
            compareFrom: { year: compareFromMonth.year, month: compareFromMonth.month, day: 1 },
            compareTo: {
                year: compareToMonth.year,
                month: compareToMonth.month,
                day: getLastDayOfMonth(compareToMonth.year, compareToMonth.month)
            }
        });

        currentMonthIndex = chunkEndMonthIndex + 1;
        chunkIndex += 1;
    }

    return chunks;
}

function describeChunk(chunk: AnnualChunk): string {
    return `${chunk.collectFrom.year}/${pad2(chunk.collectFrom.month)}/${pad2(chunk.collectFrom.day)}～${chunk.collectTo.year}/${pad2(chunk.collectTo.month)}/${pad2(chunk.collectTo.day)}`;
}

function describeSelection(rangeSelection: MonthRangeSelection): string {
    const period = buildRangePeriod(rangeSelection);

    if (period.collectFrom.year === period.collectTo.year) {
        return `${period.collectFrom.year}年${pad2(period.collectFrom.month)}月〜${pad2(period.collectTo.month)}月`;
    }

    return `${period.collectFrom.year}年${pad2(period.collectFrom.month)}月〜${period.collectTo.year}年${pad2(period.collectTo.month)}月`;
}

function buildCsvFileName(rangeSelection: MonthRangeSelection): string {
    const period = buildRangePeriod(rangeSelection);

    if (period.collectFrom.year === period.collectTo.year) {
        return `統計データ_${period.collectFrom.year}_${pad2(period.collectFrom.month)}-${pad2(period.collectTo.month)}.csv`;
    }

    return `統計データ_${period.collectFrom.year}${pad2(period.collectFrom.month)}-${period.collectTo.year}${pad2(period.collectTo.month)}.csv`;
}

function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function buildRangePeriod(rangeSelection: MonthRangeSelection): {
    collectFrom: DateParts;
    collectTo: DateParts;
    compareFrom: DateParts;
    compareTo: DateParts;
} {
    const collectFrom = { year: rangeSelection.startYear, month: rangeSelection.fromMonth, day: 1 };
    const collectTo = {
        year: rangeSelection.endYear,
        month: rangeSelection.toMonth,
        day: getLastDayOfMonth(rangeSelection.endYear, rangeSelection.toMonth)
    };
    const compareFrom = { year: collectFrom.year - 1, month: collectFrom.month, day: 1 };
    const compareTo = {
        year: collectTo.year - 1,
        month: collectTo.month,
        day: getLastDayOfMonth(collectTo.year - 1, collectTo.month)
    };

    return {
        collectFrom,
        collectTo,
        compareFrom,
        compareTo
    };
}

function toMonthIndex(year: number, month: number): number {
    return (year * 12) + (month - 1);
}

function fromMonthIndex(monthIndex: number): { year: number; month: number } {
    return {
        year: Math.floor(monthIndex / 12),
        month: (monthIndex % 12) + 1
    };
}

function formatDateParts(dateParts: DateParts): string {
    return `${dateParts.year}/${pad2(dateParts.month)}/${pad2(dateParts.day)}`;
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

function formatSignedInteger(value: number): string {
    const roundedValue = Math.round(value);

    if (roundedValue === 0) {
        return "0";
    }

    return `${roundedValue > 0 ? "+" : ""}${roundedValue.toLocaleString("en-US")}`;
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

function clearRenderedResult(elements: AnnualPanelElements): void {
    elements.result.dataset.visible = "false";
    elements.chart.replaceChildren();
    elements.table.replaceChildren();
}

function renderAggregatedResult(
    elements: AnnualPanelElements,
    rangeSelection: MonthRangeSelection,
    rows: AggregatedRow[]
): void {
    elements.result.dataset.visible = "true";
    elements.chart.replaceChildren();
    elements.table.replaceChildren();

    renderSummary(elements.chart, rangeSelection, rows);
    renderChart(elements.chart, rows);
    renderTable(elements.table, rows);
}

function renderSummary(chartContainer: HTMLDivElement, rangeSelection: MonthRangeSelection, rows: AggregatedRow[]): void {
    const summary = document.createElement("div");
    summary.className = "tlgt-annual-panel__summary";

    const totalRevenue = rows.reduce((sum, row) => sum + row.values["総合計料金"], 0);
    const compareRevenue = rows.reduce((sum, row) => sum + row.values["総合計料金（比較期間）"], 0);
    const totalCount = rows.reduce((sum, row) => sum + row.values["実績件数"], 0);
    const compareCount = rows.reduce((sum, row) => sum + row.values["実績件数（比較期間）"], 0);
    const period = buildRangePeriod(rangeSelection);

    const cards: Array<[string, string]> = [
        ["対象期間", describeSelection(rangeSelection)],
        ["前年同時期", `${period.compareFrom.year}年${pad2(period.compareFrom.month)}月〜${period.compareTo.year}年${pad2(period.compareTo.month)}月`],
        ["表示行数", `${rows.length}行`],
        ["実績件数合計", formatInteger(totalCount)],
        ["実績件数合計(前年)", formatInteger(compareCount)],
        ["総合計料金合計", formatInteger(totalRevenue)],
        ["総合計料金合計(前年)", formatInteger(compareRevenue)],
        ["総合計料金差額", formatSignedInteger(totalRevenue - compareRevenue)]
    ];

    for (const [label, value] of cards) {
        const card = document.createElement("div");
        card.className = "tlgt-annual-panel__summary-card";

        const labelElement = document.createElement("div");
        labelElement.className = "tlgt-annual-panel__summary-label";
        labelElement.textContent = label;

        const valueElement = document.createElement("div");
        valueElement.className = "tlgt-annual-panel__summary-value";
        valueElement.textContent = value;

        card.append(labelElement, valueElement);
        summary.append(card);
    }

    chartContainer.append(summary);
}

function renderChart(chartContainer: HTMLDivElement, rows: AggregatedRow[]): void {
    const title = document.createElement("h4");
    title.className = "tlgt-annual-panel__chart-title";
    title.textContent = "総合計料金 シェア";
    chartContainer.append(title);

    const rankedRows = [...rows]
        .sort((leftRow, rightRow) => {
            const feeDiff = rightRow.values["総合計料金"] - leftRow.values["総合計料金"];

            if (feeDiff !== 0) {
                return feeDiff;
            }

            return `${leftRow.salesDestinationName}${leftRow.handlingLocationName}`.localeCompare(
                `${rightRow.salesDestinationName}${rightRow.handlingLocationName}`,
                "ja"
            );
        })
        .filter((row) => row.values["総合計料金"] > 0);
    const totalRevenue = rankedRows.reduce((sum, row) => sum + row.values["総合計料金"], 0);

    if (rankedRows.length === 0 || totalRevenue === 0) {
        const empty = document.createElement("div");
        empty.textContent = "表示できる集計結果がありません。";
        chartContainer.append(empty);
        return;
    }

    const topRows = rankedRows.slice(0, 5);
    const topRevenue = topRows.reduce((sum, row) => sum + row.values["総合計料金"], 0);
    const chartEntries = topRows.map((row, index) => ({
        label: `${row.salesDestinationName} / ${row.handlingLocationName || "-"}`,
        value: row.values["総合計料金"],
        color: getPieChartColor(index)
    }));

    if (topRevenue < totalRevenue) {
        chartEntries.push({
            label: "その他",
            value: totalRevenue - topRevenue,
            color: getPieChartColor(PIE_CHART_COLORS.length - 1)
        });
    }

    const layout = document.createElement("div");
    layout.className = "tlgt-annual-panel__chart-layout";

    const pieWrap = document.createElement("div");
    pieWrap.className = "tlgt-annual-panel__pie-wrap";

    const pie = document.createElement("div");
    pie.className = "tlgt-annual-panel__pie";
    pie.style.background = buildPieGradient(chartEntries);

    const pieCenter = document.createElement("div");
    pieCenter.className = "tlgt-annual-panel__pie-center";

    const totalLabel = document.createElement("div");
    totalLabel.className = "tlgt-annual-panel__pie-total-label";
    totalLabel.textContent = "総合計料金合計";

    const totalValue = document.createElement("div");
    totalValue.className = "tlgt-annual-panel__pie-total-value";
    totalValue.textContent = formatInteger(totalRevenue);

    pieCenter.append(totalLabel, totalValue);
    pieWrap.append(pie, pieCenter);

    const legend = document.createElement("div");
    legend.className = "tlgt-annual-panel__chart-legend";

    for (const entry of chartEntries) {
        const legendItem = document.createElement("div");
        legendItem.className = "tlgt-annual-panel__chart-legend-item";

        const color = document.createElement("div");
        color.className = "tlgt-annual-panel__chart-color";
        color.style.background = entry.color;

        const labelWrap = document.createElement("div");
        labelWrap.className = "tlgt-annual-panel__chart-label-wrap";

        const label = document.createElement("div");
        label.className = "tlgt-annual-panel__chart-label";
        label.textContent = entry.label;

        const meta = document.createElement("div");
        meta.className = "tlgt-annual-panel__chart-meta";
        meta.textContent = `${formatShareRate(entry.value / totalRevenue)} / ${formatInteger(entry.value)}`;

        const value = document.createElement("div");
        value.className = "tlgt-annual-panel__chart-value";
        value.textContent = formatShareRate(entry.value / totalRevenue);

        labelWrap.append(label, meta);
        legendItem.append(color, labelWrap, value);
        legend.append(legendItem);
    }

    layout.append(pieWrap, legend);
    chartContainer.append(layout);
}

function renderTable(tableContainer: HTMLDivElement, rows: AggregatedRow[]): void {
    const title = document.createElement("h4");
    title.className = "tlgt-annual-panel__table-title";
    title.textContent = "集計結果一覧";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = [
        "販売先名",
        "取扱個所名",
        "実績件数",
        "実績件数(前年)",
        "催行率",
        "総合計料金",
        "総合計料金(前年)",
        "差額"
    ];

    for (const headerText of headers) {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.append(th);
    }

    thead.append(headerRow);

    const tbody = document.createElement("tbody");

    for (const row of rows) {
        const tr = document.createElement("tr");
        const cells = [
            row.salesDestinationName,
            row.handlingLocationName || "-",
            formatInteger(row.values["実績件数"]),
            formatInteger(row.values["実績件数（比較期間）"]),
            formatPercentage(calculateRate(row.values["実績件数"], row.values["実績件数"] + row.values["CXL件数"])),
            formatInteger(row.values["総合計料金"]),
            formatInteger(row.values["総合計料金（比較期間）"]),
            formatSignedInteger(row.values["総合計料金"] - row.values["総合計料金（比較期間）"])
        ];

        cells.forEach((cellValue, index) => {
            const td = document.createElement("td");
            td.textContent = cellValue;

            if (index >= 2) {
                td.dataset.align = "right";
            }

            tr.append(td);
        });

        tbody.append(tr);
    }

    table.append(thead, tbody);
    tableContainer.append(title, table);
}

function buildPieGradient(entries: Array<{ value: number; color: string }>): string {
    let currentDegree = 0;
    const total = entries.reduce((sum, entry) => sum + entry.value, 0);

    return `conic-gradient(${entries.map((entry) => {
        const startDegree = currentDegree;
        currentDegree += total === 0 ? 0 : (entry.value / total) * 360;
        return `${entry.color} ${startDegree}deg ${currentDegree}deg`;
    }).join(", ")})`;
}

function formatShareRate(value: number): string {
    const percent = value * 100;
    const rounded = Math.round(percent * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

function getPieChartColor(index: number): string {
    return PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] ?? PIE_CHART_COLORS[0];
}
