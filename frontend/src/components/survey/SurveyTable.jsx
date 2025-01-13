import { Badge } from 'flowbite-react';
import Link from 'next/link';
import DataTable from 'react-data-table-component';
import { RiDeleteBin4Fill, RiEdit2Fill, RiEyeFill } from 'react-icons/ri';

const SurveyTable = ({ data, setOpenDelModal, setEntryModal }) => {
	const ActionButtons = ({ id }) => {
		const style =
			'text-[17px] cursor-pointer rounded-sm p-1 text-[#252525] border border-gray-300 hover:bg-gray-200';
		return (
			<div className='flex gap-x-2.5'>
				<Link href={`surveys/${id}/view`} className={`${style}`}>
					<RiEyeFill />
				</Link>
				<Link href={`surveys/${id}/edit`} className={`${style}`}>
					<RiEdit2Fill />
				</Link>
				<div className={`${style}`} onClick={() => setOpenDelModal({ open: true, id })}>
					<RiDeleteBin4Fill />
				</div>
			</div>
		);
	};

	const columns = [
		{
			name: 'ID',
			selector: (row) => '#' + row.id,
			sortable: true,
			minWidth: '0px',
		},
		{
			name: 'Client',
			selector: (row) => row.clientName,
			sortable: true,
			minWidth: '110px',
		},
		{
			name: 'Hotel',
			selector: (row) => row.hotelName,
			sortable: true,
			minWidth: true,
			minWidth: '120px',
		},
		{
			name: 'Campaign',
			selector: (row) => row.campaign || '---',
			sortable: true,
			minWidth: '120px',
		},
		{
			name: 'Location',
			selector: (row) => row.location || '---',
			sortable: true,
			minWidth: '120px',
		},
		{
			name: 'Start Date',
			selector: (row) => (row?.startDate ? new Date(row?.startDate).toDateString() : '---'),
			sortable: true,
			minWidth: '110px',
		},
		{
			name: 'End Date',
			selector: (row) => (row?.endDate ? new Date(row?.endDate).toDateString() : '---'),
			sortable: true,
			minWidth: '110px',
		},
		{
			name: 'Audits',
			minWidth: '100px',
			cell: (row) => {
				const count = row?._count?.audits;
				return (
					<Badge
						color={count > 0 ? 'success' : 'failure'}
						onClick={() => setEntryModal({ open: true, data: row })}
						className='cursor-pointer'>
						{count}
						{count > 1 ? ' Entries' : ' Entry'}
					</Badge>
				);
			},
		},
		{
			name: 'Action',
			minWidth: '150px',
			cell: (row) => <ActionButtons id={row.id} />,
		},
	];

	return (
		<DataTable className='datatable' columns={columns} data={data} pagination customStyles={customStyles} />
	);
};

const customStyles = {
	rows: {
		style: {
			minHeight: '62px', // override the row height
		},
	},
	headCells: {
		style: {},
	},
	cells: {
		style: {},
	},
};

export default SurveyTable;
