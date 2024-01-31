import React, { useState, useEffect } from "react";
import { DatePicker, Input, Button, Modal, message, Form } from 'antd';

export const TaskModal = (props) => {
    const { open, handleOk, onCancel, onDelete } = props;
    const [item, setItem] = useState(props.item || { title: "", start: null, end: null });

    // Update local state when props.item changes
    useEffect(() => {
        if (props.item) {
            setItem(props.item);
        }
    }, [props.item]);

    const validateInputs = () => {
        if (!item.title.trim()) {
            message.error("Please enter a task name");
            return false;
        }

        if (!item.start || !item.start) {
            message.error("Please select a valid date range");
            return false;
        }

        if (item.start.valueOf() > item.end.valueOf()) {
            console.log(item.end.valueOf())
            console.log(item.start.valueOf())
            message.error("End date should be after the start date");
            return false;
        }

        return true;
    };

    const handleSave = () => {
        if (validateInputs()) {
            handleOk(item);
        }
    };

    return (
        <Modal
            visible={open}
            title="Task Modal"
            onOk={handleSave}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                props.item && (
                    <Button key="delete" type="danger" onClick={() => onDelete(item)}>
                        Delete
                    </Button>
                ),
                <Button key="save" type="primary" onClick={handleSave}>
                    Save
                </Button>,
            ]}
        >
            <div>
                <Form.Item label="Task Name">
                    <Input
                        id="taskName"
                        placeholder="Input Task Name"
                        value={item.title}
                        onChange={(e) => setItem({ ...item, title: e.target.value })}
                    />
                </Form.Item>
            </div>

            <div>
                <Form.Item label="Start and End Date">
                    <DatePicker.RangePicker
                        allowClear={false}
                        showTime
                        value={[item.start, item.end]}
                        onChange={(dates) => setItem({ ...item, start: dates[0], end: dates[1] })}
                        style={{ width: '100%' }} 
                    />
                </Form.Item>
            </div>
        </Modal>
    );
};
