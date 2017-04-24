/* @flow */

import React, {Component} from 'react';
import Draggable from 'react-draggable';
import Resizable from 'react-resizable-box';
import type {Direction, ResizeHandler, ResizeStartHandler} from 'react-resizable-box';

export type Grid = [number, number];

export type DraggableData = {
	node: HTMLElement,
	x: number,
	y: number,
	deltaX: number, deltaY: number,
	lastX: number, lastY: number
};

export type DraggableEventHandler = (e: SyntheticMouseEvent | SyntheticTouchEvent, data: DraggableData,) =>
	void
	| false;

type State = {
	disableDragging: boolean;
	z?: number;
	original: {
		x: number;
		y: number;
	};
	bounds: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

export type Enable = {
	bottom?: boolean,
	bottomLeft?: boolean,
	bottomRight?: boolean,
	left?: boolean,
	right?: boolean,
	top?: boolean,
	topLeft?: boolean,
	topRight?: boolean
}

export type HandlerClasses = {
	bottom?: string,
	bottomLeft?: string,
	bottomRight?: string,
	left?: string,
	right?: string,
	top?: string,
	topLeft?: string,
	topRight?: string
}

export type HandlerStyles = {
	bottom?: any,
	bottomLeft?: any,
	bottomRight?: any,
	left?: any,
	right?: any,
	top?: any,
	topLeft?: any,
	topRight?: any
}

type Props = {
	z?: number;
	dragGrid?: Grid;
	default: {
		x: number;
		y: number;
		width: number | string;
		height: number | string;
	};
	resizeGrid?: Grid;
	bounds?: string;
	onResizeStart?: ResizeStartHandler;
	onResize?: ResizeHandler;
	onResizeStop?: ResizeHandler;
	onDragStart?: DraggableEventHandler;
	onDrag?: DraggableEventHandler;
	onDragStop?: DraggableEventHandler;
	className?: string;
	style?: any;
	children?: any,
	enableResizing?: Enable,
	extendsProps?: any,
	resizeHandlerClasses?: HandlerClasses,
	resizeHandlerStyles?: HandlerStyles,
	lockAspectRatio?: boolean,
	maxHeight?: number,
	maxWidth?: number,
	minHeight?: number,
	minWidth?: number,
	dragAxis?: 'x' | 'y' | 'both' | 'none',
	parentScale:number
}

export type Position = {
	x: number;
	y: number;
}

const boxStyle = {
	width: 'auto',
	height: 'auto',
	cursor: 'move',
	display: 'inline-block',
};

export default class Rnd extends Component {
	
	state: State;
	resizable: Resizable;
	state: State;
	draggable: Draggable;
	onResizeStart: ResizeStartHandler;
	onResize: ResizeHandler;
	onResizeStop: ResizeHandler;
	onDragStart: DraggableEventHandler;
	onDrag: DraggableEventHandler;
	onDragStop: DraggableEventHandler;
	wrapper: HTMLElement;
	
	constructor(props: Props) {
		super(props);
		this.state = {
			disableDragging: false,
			z: props.z,
			original: {
				x: props.default.x || 0,
				y: props.default.y || 0,
			},
			bounds: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
			},
		};
		this.onResizeStart = this.onResizeStart.bind(this);
		this.onResize = this.onResize.bind(this);
		this.onResizeStop = this.onResizeStop.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onDragStop = this.onDragStop.bind(this);
	}
	
	onDragStart(e: SyntheticMouseEvent | SyntheticTouchEvent, data: DraggableData) {
		if (this.props.onDragStart) {
			this.props.onDragStart(e, data);
		}
		const parent = this.wrapper && this.wrapper.parentNode;
		const target = this.props.bounds === 'parent'
			? parent
			: document.querySelector(this.props.bounds);
		if (!this.props.bounds) return;
		if (!(target instanceof HTMLElement) || !(parent instanceof HTMLElement)) return;
		const targetRect = target.getBoundingClientRect();
		const targetLeft = targetRect.left;
		const targetTop = targetRect.top;
		const parentRect = parent.getBoundingClientRect();
		const parentLeft = parentRect.left;
		const parentTop = parentRect.top;
		const left = targetLeft - parentLeft;
		const top = targetTop - parentTop;
		this.setState({
			bounds: {
				top,
				right: left + (target.offsetWidth - (this.resizable: any).size.width),
				bottom: top + (target.offsetHeight - (this.resizable: any).size.height),
				left,
			},
		});
	}
	
	getResizableBounds() {
		if (this.props.bounds === 'parent') {
			if (!this.wrapper) return undefined;
			if (!(this.wrapper.parentNode instanceof HTMLElement)) return undefined;
			return this.wrapper.parentNode;
		}
		return document.querySelector(this.props.bounds);
	}
	
	onDrag(e: SyntheticMouseEvent | SyntheticTouchEvent, data: DraggableData) {
		if (this.props.onDrag) {
			this.props.onDrag(e, data);
		}
	}
	
	onDragStop(e: Event, data: DraggableData) {
		if (this.props.onDragStop) {
			this.props.onDragStop(e, data);
		}
	}
	
	onResizeStart(e: SyntheticMouseEvent | SyntheticTouchEvent,
	              dir: Direction,
	              refToResizableElement: HTMLElement,) {
		this.setState({
			disableDragging: true,
			original: {x: this.draggable.state.x, y: this.draggable.state.y},
		});
		if (this.props.onResizeStart) {
			this.props.onResizeStart(e, dir, refToResizableElement);
		}
		e.stopPropagation();
	}
	
	onResize(e: MouseEvent | TouchEvent,
	         direction: Direction,
	         refToResizableElement: HTMLElement,
	         delta: { height: number, width: number },) {
		if (/left/i.test(direction)) {
			this.draggable.setState({x: this.state.original.x - delta.width});
		}
		if (/top/i.test(direction)) {
			this.draggable.setState({y: this.state.original.y - delta.height});
		}
		if (this.props.onResize) {
			this.props.onResize(event, direction, refToResizableElement, delta, {
				x: this.draggable.state.x,
				y: this.draggable.state.y,
			});
		}
	}
	
	onResizeStop(e: MouseEvent | TouchEvent,
	             direction: Direction,
	             refToResizableElement: HTMLElement,
	             delta: { height: number, width: number },) {
		this.setState({disableDragging: false});
		if (this.props.onResizeStop) {
			this.props.onResizeStop(event, direction, refToResizableElement, delta, {
				x: this.draggable.state.x,
				y: this.draggable.state.y,
			});
		}
	}
	
	updateSize(size: { x: string | number, y: string | number }) {
		this.resizable.updateSize(size);
	}
	
	updatePosition(position: Position) {
		this.draggable.setState(position);
	}
	
	updateZIndex(z: number) {
		this.setState({z});
	}
	
	render() {
		return (
			<Draggable
				ref={(c: Draggable) => {
					this.draggable = c;
				}}
				handle={this.props.dragHandlerClassName}
				defaultPosition={{x: this.props.default.x, y: this.props.default.y}}
				onStart={this.onDragStart}
				onDrag={this.onDrag}
				onStop={this.onDragStop}
				axis={this.props.dragAxis}
				zIndex={this.state.z}
				grid={this.props.dragGrid}
				bounds={this.props.bounds ? this.state.bounds : undefined}
				parentScale={this.props.parentScale}
			>
				<div
					className={this.props.className}
					style={boxStyle}
					ref={(c: HTMLElement) => {
						this.wrapper = c;
					}}
				>
					<Resizable
						ref={(c: Resizable) => {
							this.resizable = c;
						}}
						enable={this.props.enableResizing}
						onResizeStart={this.onResizeStart}
						onResize={this.onResize}
						onResizeStop={this.onResizeStop}
						style={this.props.style}
						width={this.props.default.width}
						height={this.props.default.height}
						minWidth={this.props.minWidth}
						minHeight={this.props.minHeight}
						maxWidth={this.props.maxWidth}
						maxHeight={this.props.maxHeight}
						grid={this.props.resizeGrid}
						bounds={this.getResizableBounds()}
						lockAspectRatio={this.props.lockAspectRatio}
						handlerStyles={this.props.resizeHandlerStyles}
						handlerClasses={this.props.resizeHandlerClasses}
						parentScale={this.props.parentScale}
					>
						{this.props.children}
					</Resizable>
				</div>
			</Draggable>
		);
	}
}
