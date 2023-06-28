import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import schemaData from '../json/schema.json';
import listingData from '../json/data.json';
import recordDetails from '../json/record.json';
import companyData from '../json/companies.json';

const Listing = () => {
    const [fields, setFields] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [listingDataPaginated, setListingDataPaginated] = useState([]);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRecordDetails, setSelectedRecordDetails] = useState(null);
    const [form] = Form.useForm();
    const [deletedRecords, setDeletedRecords] = useState([]);

    useEffect(() => {
        const filteredFields = schemaData.fields.filter(field => field.show_in_listing);
        const sortedFields = filteredFields.sort((a, b) => a.seq - b.seq);
        setFields(sortedFields);
    }, [listingDataPaginated]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setListingDataPaginated(listingData.slice(startIndex, endIndex));
    }, [listingData, currentPage, pageSize]);

    const handleView = record => {
        setSelectedRow(record);
        const selectedRecord = recordDetails.find(item => item.id === record.id);
        setSelectedRecordDetails(selectedRecord);
        setViewModalVisible(true);
    };
    const handleUpdate = record => {
        setSelectedRow(record);
        form.setFieldsValue(record);



        // Update the company field options in the form
        const updatedFields = fields.map(field => {
            if (field.key === 'company') {
                const options = Object.entries(companyData.data).map(([id, name]) => ({
                    value: id,
                    label: name,
                }));
                return { ...field, options };
            }
            return field;
        });
        setFields(updatedFields);
        console.log(updatedFields)
        setUpdateModalVisible(true);
    };




    // Simulating the Ajax call for saving the updated record
    const simulateSaveRecord = values => {
        const { id } = selectedRow;

        // Simulate different responses based on the record ID
        if (id === recordDetails[0].id) {
            // Simulate success (status 200)
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({ status: 200 });
                }, 1000);
            });
        } else {
            // Simulate error (status 500)
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject({ status: 500 });
                }, 1000);
            });
        }
    };



    const handleRemove = record => {
        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure you want to remove this record?',
            onOk: () => {
                // Simulate Ajax call for record removal
                simulateRemoveRecord(record.id)
                    .then(response => {
                        if (response.status === 200) {
                            // Handle success (status 200)
                            console.log('Status ' + response.status + ': Record removed successfully:', record.id);
                            // Gray out the deleted record by updating its status
                            const updatedListingData = listingDataPaginated.map(item => {
                                if (item.id === record.id) {
                                    return { ...item, deleted: true };
                                }
                                return item;
                            });
                            setListingDataPaginated(updatedListingData);
                            // Add the deleted record to the deletedRecords state
                            setDeletedRecords(prevDeletedRecords => [...prevDeletedRecords, record.id]);
                        } else if (response.status === 500) {
                            // Handle error (status 500)
                            console.log('Status ' + response.status + ': An error occurred while removing the record:', record.id);
                            // Display error message or perform appropriate error handling
                        } else {
                            // Handle other statuses if needed
                            console.log('An error occurred with status:', response.status);
                        }
                    })
                    .catch(error => {
                        // Handle network errors or other exceptions
                        console.log('An error occurred:', error);
                    });
            },
            onCancel: () => {
                console.log('Removal canceled.');
            },
        });
    };

    // Simulating the Ajax call for removing a record
    const simulateRemoveRecord = recordId => {
        // Simulate different responses based on the record ID
        if (recordId === recordDetails[0].id) {
            // Simulate success (status 200)
            return Promise.resolve({ status: 200 });
        } else {
            // Simulate error (status 500)
            return Promise.resolve({ status: 500 });
        }
    };


    const handleViewModalOk = () => {
        setViewModalVisible(false);
    };

    const handleUpdateModalOk = () => {
        form.validateFields()
            .then(values => {


                const companyName = companyData.data[values.company];

                const updatedValues = { ...values, company: companyName };

                console.log('Updated values:', updatedValues);

                // Simulate Ajax call for saving the updated record
                simulateSaveRecord(values)
                    .then(response => {
                        if (response.status === 200) {
                            // Handle success (status 200)
                            console.log('Record saved successfully.');

                            // Update listingData with the updated record
                            const updatedListingData = listingData.map(item => {
                                if (item.id === selectedRow.id) {
                                    return { ...item, ...values };
                                }
                                return item;
                            });


                            // Update listingDataPaginated with the updated data
                            const startIndex = (currentPage - 1) * pageSize;
                            const endIndex = startIndex + pageSize;
                            setListingDataPaginated(updatedListingData.slice(startIndex, endIndex));

                            // Display success message
                            message.success('Record saved successfully.');

                            // Close the modal and clear form fields
                            setUpdateModalVisible(false);
                            form.resetFields();
                        } else if (response.status === 500) {
                            // Handle error (status 500)
                            console.log('An error occurred while saving the record.');

                            // Display error message or perform appropriate error handling
                            message.error('An error occurred while saving the record.');
                        } else {
                            // Handle other statuses if needed
                            console.log('An error occurred with status:', response.status);
                        }
                    })
                    .catch(error => {
                        // Handle network errors or other exceptions
                        console.log('An error occurred:', error);
                    });
            })
            .catch(error => {
                console.log('Form validation failed:', error);
            });
    };




    const handlePageChange = page => {
        setCurrentPage(page);
    };

    const columns = fields.map((field, index) => ({
        title: field.label,
        dataIndex: field.key,
        key: `column-${index}`,
        render: (value, record) => {
            if (field.key === 'company') {
                const companyName = companyData.data[value];
                return <span>{companyName}</span>;
            }
            return value;
        },
    }));


    // CSS class for grayed-out records
    const deletedRecordClassName = 'deleted-record';

    // Helper function to determine if a record is deleted
    const isRecordDeleted = record => deletedRecords.includes(record.id);

    // Helper function to generate row class name based on record's deleted status
    const getRowClassName = record => {
        if (isRecordDeleted(record)) {
            return deletedRecordClassName;
        }
        return '';
    };

    columns.push({
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <div>
                <Button onClick={() => handleView(record)}>View</Button>
                <Button onClick={() => handleUpdate(record)}>Update</Button>
                {!isRecordDeleted(record) && (
                    <Button onClick={() => handleRemove(record)}>Remove</Button>
                )}
            </div>
        ),
    });


    return (
        <div>

            <Table
                dataSource={listingDataPaginated}
                columns={columns}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: listingData.length,
                    onChange: handlePageChange,
                }}
                rowClassName={getRowClassName}
            />

            <Modal
                title="View Record"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                onOk={handleViewModalOk}
                footer={null}
            >
                {selectedRecordDetails && (
                    <Table dataSource={[selectedRecordDetails]} columns={columns.filter(column => column.key !== 'actions')}
                        pagination={false} />
                )}
            </Modal>

            <Modal
                title="Update Record"
                open={updateModalVisible}
                onCancel={() => setUpdateModalVisible(false)}
                onOk={handleUpdateModalOk}
                key="updateModal"
            >
                {selectedRow && (
                    <Form form={form} layout="vertical">
                        {fields.map(field => (
                            <Form.Item
                                key={field.key}
                                label={field.label}
                                name={field.key}
                                rules={[
                                    { required: field.required, message: `${field.label} is required` },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        ))}
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default Listing;
