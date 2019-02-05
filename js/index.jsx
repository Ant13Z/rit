class ElementList extends React.Component {
	constructor (props) {
		super(props);
	}

	delElement = function (elemsId) {
		this.props.dispatch({
			type: "delElement",
			elemsId: elemsId
		});
	}

	render () {
		return (
			<li>
				<span>{this.props.name}</span>
				<button onClick={this.delElement.bind(this, this.props.id)}>Х</button>
			</li>
		);
	}
}

class List extends React.Component {
	constructor (props) {
		super(props);
	}

	render () {
		let dispatch = this.props.dispatch;
		let ElementsList = this.props.activeElems.map(function(value, key) {
			if (value.statusList) {
				return (
					<ElementList name={value.title} id={value.elemsId} dispatch={dispatch} />
				);
			}
		});
		return (
			<ul>
				{ElementsList}
			</ul>
		);
	}
}

class G extends React.Component {
	constructor (props) {
		super(props);
	}

	addElement = function (elemsId, title, status) {
		this.props.dispatch({
			type: "addElement",
			elemsId: elemsId,
			title: title,
			statusList: false
		});

		setTimeout(() => {
			this.props.dispatch({
				type: "editElement",
				elemsId: elemsId,
				statusList: status
			});
		}, 1000);
	}

	render () {
		return (
			<g>
				<path 
					onClick={this.addElement.bind(this, this.props.id, this.props.title, this.props.status)} 
					transform={"translate(" + this.props.translate + ")"} 
					fill="#fff" 
					id={"stroke_path" + this.props.id} 
					d={this.props.path1} 
				/>
				<path 
					onClick={this.addElement.bind(this, this.props.id, this.props.title, this.props.status)} 
					transform={"translate(" + this.props.translate + ")"} 
					fill={this.props.fill} 
					id={"stroke_path" + this.props.id} 
					d={this.props.path2} 
				/>
			</g>
		);
	}

}

class Page extends React.Component {
	constructor (props) {
		super(props);
	}

	zoomInc = function (zoom) {
		if (zoom < 2)
			this.props.dispatch({
				type: "zoomInc",
				zoom: zoom
			});
	}

	zoomDec = function (zoom) {
		if (zoom > 0.5)
			this.props.dispatch({
				type: "zoomDec",
				zoom: zoom
			});
	}


	render () {
		let activeElemsID = {};
		let dispatch = this.props.dispatch;

		for (let i = 0; i < this.props.activeElems.length; i++)
			activeElemsID[this.props.activeElems[i].elemsId] = true;

		//1) толщина двух элементов (перерисовывать svg?)
		let g = this.props.svg.g.map(function(value, key){
			let fill = !!activeElemsID[value.elemsId] ? value.fillSelected : value.fill;
			return (
				<G 
					translate={value.translate} 
					fill={fill} 
					id={value.elemsId} 
					dispatch={dispatch} 
					path1={value.path1}
					path2={value.path2} 
					title={value.title}
					status={value.status}
				/>
			);
		});

		let svgStyle = {
			zoom: this.props.zoom
		}
		//не особо понятно нужно ли реализовавывать dnd внутри зума
		return (
			<div id="main-react">
				<div class="header">
					<div class="left">&lt;</div>
					<div class="title">
						<h1>Повреждения</h1>
						<h3>Участник "А" VW POLO</h3>
					</div>
					<div class="right">O</div>
					<div class="clear"></div>
				</div>
				<div class="body">
					<div class="left">
						<svg 
							width={this.props.svg.width} 
							height={this.props.svg.height} 
							viewBox={"0 0 " + this.props.svg.width + " " + this.props.svg.height} 
							version="1.1"
							style={svgStyle}
						>
							<g id="Canvas" transform={"translate(" + this.props.svg.translate + ")"}>
								{g}
							</g>
						</svg>
					</div>
					<div class="right-side">
						<button onClick={this.zoomInc.bind(this, this.props.zoom)}>+</button>
						<button onClick={this.zoomDec.bind(this, this.props.zoom)}>-</button>
					</div>
					<div class="clear"></div>
				</div>
				<div class="footer">
					<List activeElems={this.props.activeElems} dispatch={dispatch} />
					<div>
						<button>Следующий шаг</button>
					</div>
				</div>
			</div>
		);
	}
}

//обработка передачи данных из хранилища в модуль
let mapStateToProps = function (state) {
 	return {
		activeElems: state.elemsCar,
		zoom: state.zoom
  	}
}

//обработка логики (модель) работы хранилища
//приложение маленькое, поэтому 1 редьюсер (чисто по логике зум и работа с элементами = 2 редьюсера)
let appReducer = function (
	state = {
		elemsCar: [],
		zoom: 1
	}, action
) {
	let elems = state.elemsCar.slice();
	let zoom = state.zoom;

	switch (action.type) {
		case 'addElement':
			//проверка на уникальность
			let uniq = true;
			for (let i = 0; i < elems.length; i++) {
				if (elems[i].elemsId === action.elemsId) {
					alert("Такой элемент уже добавлен");
					uniq = false;
					break;
				} 
			}

			if (uniq) {
				elems.push({
					elemsId: action.elemsId,
					title: action.title,
					statusList: action.statusList
				});
			}

			break;
		case 'editElement':
			for (let i = 0; i < elems.length; i++) {
				if (elems[i].elemsId === action.elemsId) {
					if (action.statusList) {
						elems[i].statusList = action.statusList;
					} else {
						elems.splice(i, 1);
						alert("Неудовлетворительное состояние (/svg/svg.jsx)");
					}
					break;
				}
			}
			break;
		case 'delElement':
			for (let i = 0; i < elems.length; i++) {
				if (elems[i].elemsId === action.elemsId) {
					elems.splice(i, 1);
					break;
				} 
			}
			break;
		case "zoomInc":
			zoom += 0.1;
			break;
		case "zoomDec":
			zoom -= 0.1;
			break;
	}
	return {
		elemsCar: elems,
		zoom: zoom
	}
}

//хранилище
let store = Redux.createStore(appReducer,{
	elemsCar: [
		{elemsId: 16, title: 'Правая передняя дверь', statusList: true},
		{elemsId: 17, title: 'Правая задняя дверь', statusList: true},
		{elemsId: 18, title: 'Правое заднее крыло', statusList: true},
	],
	zoom: 1
});

let App = ReactRedux.connect(mapStateToProps)(Page);

ReactDOM.render(
	<ReactRedux.Provider store={store}>
		<App svg={svg} />
	 </ReactRedux.Provider>,
	document.querySelector('#main')
);