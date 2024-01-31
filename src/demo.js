'use strict';

import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import timelineItems from './timelineItems';
import Timeline from './timeline';
import {
  customItemRenderer,
  customGroupRenderer,
  CustomCellRenderer,
  CustomColumnHeaderRenderer
} from './demo/customRenderers';

import { Form, Button, Checkbox, Icon, DatePicker } from 'antd';
import 'antd/dist/antd.css';
import './style.css';
import { TaskModal } from './components/modal';

const { TIMELINE_MODES } = Timeline;

const ITEM_DURATIONS = [moment.duration(6, 'hours'), moment.duration(12, 'hours'), moment.duration(18, 'hours')];

const COLORS = ['#0099cc', '#f03a36', '#06ad96', '#fce05b', '#dd5900', '#cc6699'];

export default class DemoTimeline extends Component {
  constructor(props) {
    super(props);

    // Initialize with the first event's start and end dates
    let earliestStartDate = new Date(timelineItems[0].start);
    let latestEndDate = new Date(timelineItems[0].end);

    // Iterate through the events to find the earliest start date and latest end date
    timelineItems.forEach(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);

      if (startDate < earliestStartDate) {
        earliestStartDate = startDate;
      }

      if (endDate > latestEndDate) {
        latestEndDate = endDate;
      }
    });

    const startDate = moment(earliestStartDate);
    const endDate = moment(latestEndDate);
    this.state = {
      items: timelineItems,
      selectedItem: null,
      selectedItems: [],
      rows: 1,
      items_per_row: timelineItems.length,
      snap: 60,
      startDate,
      endDate,
      message: '',
      timelineMode: TIMELINE_MODES.SELECT | TIMELINE_MODES.DRAG | TIMELINE_MODES.RESIZE,
      multipleColumnsMode: false,
      useMoment: true,
      isModalOpen: false,
    };
    this.reRender = this.reRender.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.setNextDate = this.setNextDate.bind(this);
    this.setPrevDate = this.setPrevDate.bind(this);
    this.toggleCustomRenderers = this.toggleCustomRenderers.bind(this);
    this.toggleSelectable = this.toggleSelectable.bind(this);
    this.toggleDraggable = this.toggleDraggable.bind(this);
    this.toggleResizable = this.toggleResizable.bind(this);
    this.toggleUseMoment = this.toggleUseMoment.bind(this);
    this.toggleMultipleColumnsMode = this.toggleMultipleColumnsMode.bind(this);
  }

  componentWillMount() {
    this.reRender();
  }

  reRender(useMoment = this.state.useMoment) {
    const list = [];
    const groups = [];
    const { snap, items } = this.state;

    this.key = 0;
    for (let i = 0; i < this.state.rows; i++) {
      groups.push({ id: i, title: `Tasks`, description: `This is Task Time Line` });
      items.map((item, j) => {
        this.key += 1;
        const color = COLORS[(i + j) % COLORS.length];
        const name = item.name ?? item.title
        // let start = last_moment;
        let startDate = new Date(item.start)
        let endDate = new Date(item.end)

        let start = moment(startDate);
        let end = moment(endDate);

        // Round to the nearest snap distance
        const roundedStartSeconds = Math.floor(start.second() / snap) * snap;
        const roundedEndSeconds = Math.floor(end.second() / snap) * snap;
        start.second(roundedStartSeconds);
        end.second(roundedEndSeconds);

        list.push({
          key: this.key,
          title: name,
          color,
          row: i,
          start: useMoment ? start : start.valueOf(),
          end: useMoment ? end : end.valueOf()
        });
      })
    }

    const tableColumns = [
      // default renderers
      {
        width: 100,
        headerLabel: 'Title',
        labelProperty: 'title'
      },
      // custom renderers: react elements
      {
        width: 250,
        cellRenderer: <Checkbox>Checkbox</Checkbox>,
        headerRenderer: (
          <span>
            <Icon type="check-circle" /> Custom check
          </span>
        )
      },
      // custom renderers: class component
      {
        width: 100,
        headerRenderer: CustomColumnHeaderRenderer,
        cellRenderer: CustomCellRenderer
      }
    ];

    // this.state = {selectedItems: [11, 12], groups, items: list};
    this.forceUpdate();
    this.setState({ items: list, groups, tableColumns, useMoment });
  }

  handleRowClick = (e, rowNumber, clickedTime, snappedClickedTime) => {
    const message = `Row Click row=${rowNumber} @ time/snapped=${clickedTime.toString()}/${snappedClickedTime.toString()}`;
    this.setState({ selectedItems: [], message });
  };
  zoomIn() {
    let currentMilliseconds = this.state.endDate.diff(this.state.startDate, 'milliseconds');
    let newSec = currentMilliseconds / 2;
    this.setState({ endDate: this.state.startDate.clone().add(newSec, 'milliseconds') });
  }
  setNextDate() {
    let currentMilliseconds = this.state.endDate.diff(this.state.startDate, 'milliseconds');
    let diffs = currentMilliseconds / 6;
    this.setState({
      startDate: this.state.startDate.clone().add(diffs, 'milliseconds'),
      endDate: this.state.endDate.clone().add(diffs, 'milliseconds')
    })
  }
  setPrevDate() {
    let currentMilliseconds = this.state.endDate.diff(this.state.startDate, 'milliseconds');
    let diffs = currentMilliseconds / 6;
    this.setState({
      startDate: this.state.startDate.clone().add(-diffs, 'milliseconds'),
      endDate: this.state.endDate.clone().add(-diffs, 'milliseconds')
    })
  }
  zoomOut() {
    let currentMilliseconds = this.state.endDate.diff(this.state.startDate, 'milliseconds');
    let newSec = currentMilliseconds * 2;
    this.setState({ endDate: this.state.startDate.clone().add(newSec, 'milliseconds') });
  }

  toggleCustomRenderers(checked) {
    this.setState({ useCustomRenderers: checked });
  }

  toggleSelectable() {
    const { timelineMode } = this.state;
    let newMode = timelineMode ^ TIMELINE_MODES.SELECT;
    this.setState({ timelineMode: newMode, message: 'Timeline mode change: ' + timelineMode + ' -> ' + newMode });
  }
  toggleDraggable() {
    const { timelineMode } = this.state;
    let newMode = timelineMode ^ TIMELINE_MODES.DRAG;
    this.setState({ timelineMode: newMode, message: 'Timeline mode change: ' + timelineMode + ' -> ' + newMode });
  }
  toggleResizable() {
    const { timelineMode } = this.state;
    let newMode = timelineMode ^ TIMELINE_MODES.RESIZE;
    this.setState({ timelineMode: newMode, message: 'Timeline mode change: ' + timelineMode + ' -> ' + newMode });
  }
  toggleUseMoment() {
    const { useMoment } = this.state;
    this.reRender(!useMoment);
  }
  toggleMultipleColumnsMode() {
    const { multipleColumnsMode } = this.state;
    this.setState({ multipleColumnsMode: !multipleColumnsMode });
  }
  handleItemClick = (e, key) => {
    const message = `Item Click ${key}`;
    const { selectedItems } = this.state;

    let newSelection = selectedItems.slice();

    // If the item is already selected, then unselected
    const idx = selectedItems.indexOf(key);
    if (idx > -1) {
      // Splice modifies in place and returns removed elements
      newSelection.splice(idx, 1);
    } else {
      newSelection.push(Number(key));
    }

    this.setState({ selectedItems: newSelection, message });
  };

  handleItemDoubleClick = (e, key) => {
    const message = `Item Double Click ${key}`;
    const selectedItem = this.state.items.find(item => item.key === key);

    this.setState({ selectedItem: selectedItem, isModalOpen: true, message });
  };

  handleItemContextClick = (e, key) => {
    const message = `Item Context ${key}`;
    this.setState({ message });
  };

  handleRowDoubleClick = (e, rowNumber, clickedTime, snappedClickedTime) => {
    const message = `Row Double Click row=${rowNumber} time/snapped=${clickedTime.toString()}/${snappedClickedTime.toString()}`;
    const randomIndex = Math.floor(Math.random() * Math.floor(ITEM_DURATIONS.length));

    let start = snappedClickedTime.clone();
    let end = snappedClickedTime.clone().add(ITEM_DURATIONS[randomIndex]);
    this.key++;

    const item = {
      key: this.key++,
      title: 'New item',
      color: 'yellow',
      row: rowNumber,
      start: start,
      end: end
    };

    const newItems = _.clone(this.state.items);
    newItems.push(item);

    this.setState({ items: newItems, message });
  };

  handleRowContextClick = (e, rowNumber, clickedTime, snappedClickedTime) => {
    const message = `Row Click row=${rowNumber} @ time/snapped=${clickedTime.toString()}/${snappedClickedTime.toString()}`;
    this.setState({ message });
  };

  handleInteraction = (type, changes, items) => {
    /**
     * this is to appease the codefactor gods,
     * whose wrath condemns those who dare
     * repeat code beyond the sacred 5 lines...
     */
    function absorbChange(itemList, selectedItems) {
      itemList.forEach(item => {
        let i = selectedItems.find(i => {
          return i.key == item.key;
        });
        if (i) {
          item = i;
          item.title = item.title;
        }
      });
    }

    switch (type) {
      case Timeline.changeTypes.dragStart: {
        return this.state.selectedItems;
      }
      case Timeline.changeTypes.dragEnd: {
        const newItems = _.clone(this.state.items);

        absorbChange(newItems, items);
        this.setState({ items: newItems });
        break;
      }
      case Timeline.changeTypes.resizeStart: {
        return this.state.selectedItems;
      }
      case Timeline.changeTypes.resizeEnd: {
        const newItems = _.clone(this.state.items);

        // Fold the changes into the item list
        absorbChange(newItems, items);

        this.setState({ items: newItems });
        break;
      }
      case Timeline.changeTypes.itemsSelected: {
        this.setState({ selectedItems: _.map(changes, 'key') });
        break;
      }
      default:
        return changes;
    }
  };

  handleModalOk = (item) => {

    // Create a new array with the updated item
    const updatedItems = this.state.items.map(existingItem => {
      // Check if the item has the same key as the one to be updated
      if (existingItem.key === item.key) {
        // Update the item with the new values
        return item
      }
      return existingItem;
    });

    this.setState({ items: updatedItems, isModalOpen: false });
  }

  handleModalDelete = (item) => {
    // Filter out the item with the specified key
    const updatedItems = this.state.items.filter(existingItem => existingItem.key !== item.key);

    this.setState({ items: updatedItems, isModalOpen: false });
  }

  handleModalCancel = () => {
    this.setState({ isModalOpen: false })
  }

  render() {
    const {
      selectedItems,
      rows,
      items_per_row,
      selectedItem,
      snap,
      startDate,
      endDate,
      items,
      groups,
      message,
      isModalOpen,
      useCustomRenderers,
      timelineMode,
      useMoment,
      multipleColumnsMode,
      tableColumns
    } = this.state;
    const rangeValue = [startDate, endDate];

    const rowLayers = [];
    for (let i = 0; i < rows; i += 1) {
      if (i % 5 === 0 && i !== 0) {
        continue;
      }
      let curDate = startDate.clone();
      while (curDate.isSameOrBefore(endDate)) {
        const dayOfWeek = Number(curDate.format('d')); // 0 -> 6: Sun -> Sat
        let bandDuration = 0; // days
        let color = '';
        if (dayOfWeek % 6 === 0) {
          color = 'blue';
          bandDuration = dayOfWeek === 6 ? 2 : 1; // 2 if sat, 1 if sun
        } else {
          color = 'green';
          bandDuration = 6 - dayOfWeek;
        }

        rowLayers.push({
          start: this.state.useMoment ? curDate.clone() : curDate.valueOf(),
          end: this.state.useMoment
            ? curDate.clone().add(bandDuration, 'days')
            : curDate
              .clone()
              .add(bandDuration, 'days')
              .valueOf(),
          style: { backgroundColor: color, opacity: '0.3' },
          rowNumber: i
        });
        curDate.add(bandDuration, 'days');
      }
    }

    return (
      <div className="demo">
        <div style={{ margin: 24 }}>
          <Form layout="inline">
            <Form.Item>
              <Button onClick={this.zoomIn}>Zoom in</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.zoomOut}>Zoom out</Button>
            </Form.Item>
            <Form.Item label="Date Range">
              <DatePicker.RangePicker
                allowClear={false}
                value={rangeValue}
                showTime
                onChange={e => {
                  this.setState({ startDate: e[0], endDate: e[1] }, () => this.reRender());
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button onClick={this.setNextDate}>Next Date</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.setPrevDate}>Prev Date</Button>
            </Form.Item>
          </Form>
          <TaskModal
            open={isModalOpen}
            handleOk={this.handleModalOk}
            onCancel={this.handleModalCancel}
            onDelete={this.handleModalDelete}
            item={selectedItem}
          ></TaskModal>
        </div>
        <Timeline
          shallowUpdateCheck
          items={items}
          groups={groups}
          useMoment={useMoment}
          startDate={useMoment ? startDate : startDate.valueOf()}
          endDate={useMoment ? endDate : endDate.valueOf()}
          tableColumns={multipleColumnsMode ? tableColumns : []}
          rowLayers={rowLayers}
          selectedItems={selectedItems}
          timelineMode={timelineMode}
          snapMinutes={snap}
          onItemClick={this.handleItemClick}
          onItemDoubleClick={this.handleItemDoubleClick}
          onItemContextClick={this.handleItemContextClick}
          onInteraction={this.handleInteraction}
          onRowClick={this.handleRowClick}
          onRowContextClick={this.handleRowContextClick}
          onRowDoubleClick={this.handleRowDoubleClick}
          itemRenderer={useCustomRenderers ? customItemRenderer : undefined}
          groupRenderer={useCustomRenderers ? customGroupRenderer : undefined}
          groupTitleRenderer={useCustomRenderers ? () => <div>Group title</div> : undefined}
        />
      </div>
    );
  }
}
