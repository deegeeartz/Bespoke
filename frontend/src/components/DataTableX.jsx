import DataTable from 'react-data-table-component';

const DataTableX = ({ data, columns }) => {
	return (
		<DataTable
			className='datatable'
			columns={columns}
			data={data}
			pagination
			// expandableRows={true}
			// expandableRowsComponent={ExpandedComponent}
			// expandOnRowClicked={true}
			customStyles={customStyles}
		/>
	);
};

const customStyles = {
	rows: {
		style: {
			minHeight: '62px',
		},
	},
};

export default DataTableX;
