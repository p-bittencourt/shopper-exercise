const customers = [
  {
    customer_code: 'CUST001',
    measures: [
      {
        measure_uuid: '1a2b3c4d-1234-5678-9101-abcdef123456',
        measure_datetime: new Date('2024-07-15T10:00:00Z'),
        measure_type: 'WATER',
        has_confirmed: true,
        image_url: 'https://example.com/image1.jpg',
      },
      {
        measure_uuid: '2b3c4d5e-2345-6789-1011-bcdef2345678',
        measure_datetime: new Date('2024-08-15T12:00:00Z'),
        measure_type: 'WATER',
        has_confirmed: false,
        image_url: 'https://example.com/image2.jpg',
      },
    ],
  },
  {
    customer_code: 'CUST002',
    measures: [
      {
        measure_uuid: '3c4d5e6f-3456-7890-1121-cdef34567890',
        measure_datetime: new Date('2024-07-20T14:00:00Z'),
        measure_type: 'WATER',
        has_confirmed: true,
        image_url: 'https://example.com/image3.jpg',
      },
    ],
  },
  {
    customer_code: 'CUST003',
    measures: [
      {
        measure_uuid: '4d5e6f7g-4567-8901-2232-def456789012',
        measure_datetime: new Date('2024-06-10T09:00:00Z'),
        measure_type: 'WATER',
        has_confirmed: true,
        image_url: 'https://example.com/image4.jpg',
      },
      {
        measure_uuid: '5e6f7g8h-5678-9012-3343-ef5678901234',
        measure_datetime: new Date('2024-08-25T16:00:00Z'),
        measure_type: 'GAS',
        has_confirmed: false,
        image_url: 'https://example.com/image5.jpg',
      },
    ],
  },
];

export default customers;
