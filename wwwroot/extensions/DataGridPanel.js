const DATAGRID_CONFIG = {
    requiredProps: ['name', 'Area', 'Volume', 'Length', 'Category', 'BOQDesc'], 
    columns: [ 
        //{ title: 'ID', field: 'dbid' },
       // { title: 'Name', field: 'name', width: 150 },
         {title: 'Category', field: 'category'},
         {title: "BOQDesc", field: 'BOQDesc'},
        { title: 'Volume', field: 'volume', hozAlign: 'left', formatter: 'progress' },
        {title: 'Area', field:'area'},
        { title: 'Level', field: 'level' }
    ],
    groupBy: 'level', // Optional column to group by
    createRow: (dbid, name, props) => { // Function generating grid rows based on recieved object properties
        const volume = props.find(p => p.displayName === 'Volume')?.displayValue;
        const BOQDesc = props.find(p => p.displayName === 'BOQDesc')?.displayValue;
        const category = props.find(p => p.displayName === 'Category')?.displayValue;
        const area = props.find(p => p.displayName === 'Area')?.displayValue;
       // const length = props.find(p => p.displayName === 'Length' && p.displayCategory === 'Constraints')?.displayValue;
        return { dbid, name, volume, area, category, BOQDesc };
    },
    onRowClick: (row, viewer) => {
        viewer.isolate([row.dbid]);
        viewer.fitToView([row.dbid]);
    }
};

export class DataGridPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 400) + 'px';
        this.container.style.resize = 'none';
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        this.content.style.height = '350px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `<div class="datagrid-container" style="position: relative; height: 350px;"></div>`;
        this.container.appendChild(this.content);
        // See http://tabulator.info
        this.table = new Tabulator('.datagrid-container', {
            height: '100%',
            layout: 'fitColumns',
            columns: DATAGRID_CONFIG.columns,
            groupBy: DATAGRID_CONFIG.groupBy,
            rowClick: (e, row) => DATAGRID_CONFIG.onRowClick(row.getData(), this.extension.viewer)
        });
    }

    update(model, dbids) {
        model.getBulkProperties(dbids, { propFilter: DATAGRID_CONFIG.requiredProps }, (results) => {
            this.table.replaceData(results.map((result) => DATAGRID_CONFIG.createRow(result.dbId, result.name, result.properties)));
        }, (err) => {
            console.error(err);
        });
    }
}