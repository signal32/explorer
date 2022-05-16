import {reactive} from 'vue';
import changelog from '@/assets/changelog.json';

export interface DebugService {
    diagnostics: Map<string, DiagnosticData[]>,
    setDiagnosticData: (data: DiagnosticData) => void,
}

declare type DiagnosticData = ListDiagnosticData | TableDiagnosticData;

interface BaseDiagnosticData {
    scope: string,
    name: string,
    type: 'list' | 'map';
}

interface ListDiagnosticData extends BaseDiagnosticData {
    values: string[],
    type: 'list'
}

interface TableDiagnosticData extends BaseDiagnosticData {
    values: Map<any, any>,
    type: 'map'
}

function defineDebugService(): DebugService {
    return reactive<DebugService>({
        diagnostics: new Map<string, DiagnosticData[]>(),
        setDiagnosticData(data) {
            if (this.diagnostics.has(data.scope)) {
                let found = false
                this.diagnostics.get(data.scope)?.forEach((v) => {
                    if (v.name == data.name) {
                        v.type = data.type;
                        v.values = data.values;
                        found = true;
                    }
                })

                if (!found) {
                    this.diagnostics.get(data.scope)?.push(data);
                }
            }
            else {
                this.diagnostics.set(data.scope, [data])
            }
        }
    });
}

/// Populates a changelog section of the info screen
function loadChangelog() {
    changelog.forEach(item => {
        debugService.setDiagnosticData({
            name: item.version,
            type: 'list', values: item.changes,
            scope:'Changelog',
        })
    })
}

export const debugService = defineDebugService();
loadChangelog();


