import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react';
import axios from 'axios'
import 'devextreme/dist/css/dx.light.css';

import DataGrid, {
			Column,
			MasterDetail,
			Sorting,
			FilterRow,
			SearchPanel
		} from 'devextreme-react/data-grid';
import Chart, {
	Series, 
	ArgumentAxis, 
	ValueAxis,
	ConstantLine,
	Label
} from 'devextreme-react/chart';

const columns: GridColDef[] = [
	{field: "id", headerName: "ID"}	
]

function App() {
	const [getLogs, setGetLogs] = useState({})

	useEffect(() => {
		axios.get('https://unityperformancelogging.krazysh01.repl.co/api/performance_logs/').then(response => {
			setGetLogs(response);
		}).catch(error => {
			console.log(error)
		});
	}, [])
	
  return (
    <div className="App">
			<div>{getLogs.status === 200 ? <div>
				<DataGrid
					dataSource={getLogs.data}
					keyExpr="id"
					>
					<Sorting mode='multiple'/>
					<FilterRow visible={true} />
					<SearchPanel visible={true} />
					<Column
						dataField='id'
						allowSorting='false'
						/>
					<Column
						dataField='ApplicationName'
						caption="Application"
						/>
					<Column
						dataField='ApplicationVersion'
						caption="Version"
						/>
					<Column 
						dataField='Device.deviceModel'
						caption="Device Model"/>
					<Column 								 
  					dataField='Device.operatingSystem'
						caption="Operating System"/>
					<Column 								 
  					dataField='Device.deviceID'
						caption="Device ID"/>
					<Column
						dataField='SessionDate'
						caption="Session Date"
						dataType="date"
						/>
					<MasterDetail
						enabled={true}
						component={LogDetails}
						></MasterDetail>
				</DataGrid>
			</div> : <p>Loading Logs</p>}</div>
    </div>
  );
}

function LogDetails(props) {
	const log = props.data.data;
	const events = log["EventHistory"]
	const framerate = log["FrameRateHistory"];
	var framerateSeries = [];
	Object.keys(framerate).forEach((timestamp) => {
		framerateSeries.push({
			"timestamp": parseFloat(timestamp),
			"framerate": framerate[timestamp]
		})
	});
	const eventLines = [];
	if(events) {
		for(const event of Object.keys(events)) {
			eventLines.push(
				<ConstantLine 
					value={parseFloat(event)}>
					<Label text={events[event]}/>
				</ConstantLine>
				);
		}
	}
	return (
		<div>
			<Chart dataSource={framerateSeries}>
				<Series
					argumentField="timestamp"
					valueField="framerate"
					name="Framerate"
					type="line"
					/>
				<ArgumentAxis title="Session Time">
					{eventLines}
				</ArgumentAxis>
				<ValueAxis title="Framerate"/>
			</Chart>
		</div>
	);
}

export default App;
