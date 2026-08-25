import '@testing-library/jest-dom';
import { cx, sortData } from '.';

describe('cx util', () => {
  it('return valid classes', () => {
    // eslint-disable-next-line no-constant-binary-expression -- literal booleans intentionally simulate conditional class names
    const classNames = ['table', false && 'show', true && 'hide'];
    expect(cx(classNames)).toEqual('table hide');
  });
  it('return one class', () => {
    // eslint-disable-next-line no-constant-binary-expression -- literal booleans intentionally simulate conditional class names
    const classNames = [false && 'table', false && 'show', true && 'hide'];
    expect(cx(classNames)).toEqual('hide');
  });

  it('return no class', () => {
    // eslint-disable-next-line no-constant-binary-expression -- literal booleans intentionally simulate conditional class names
    const classNames = [false && 'table', false && 'show', false && 'hide'];
    expect(cx(classNames)).toEqual('');
  });
});

describe('sortData util', () => {
  interface TestData {
    id: number;
    name: string;
    age: number | null;
  }

  const testData: TestData[] = [
    { id: 1, name: 'John', age: 25 },
    { id: 2, name: 'Alice', age: 30 },
    { id: 3, name: 'Bob', age: 20 },
    { id: 4, name: 'Eve', age: null },
  ];

  describe('Test Sorting by a Numeric Field', () => {
    test('sorts data by age in ascending order', () => {
      const result = sortData({
        dataSource: testData,
        sortBy: 'age',
        sortOrder: 'asc',
      });

      expect(result).toEqual([
        { id: 3, name: 'Bob', age: 20 },
        { id: 1, name: 'John', age: 25 },
        { id: 2, name: 'Alice', age: 30 },
        { id: 4, name: 'Eve', age: null },
      ]);
    });

    test('sorts data by age in descending order', () => {
      const result = sortData({
        dataSource: testData,
        sortBy: 'age',
        sortOrder: 'desc',
      });

      expect(result).toEqual([
        { id: 2, name: 'Alice', age: 30 },
        { id: 1, name: 'John', age: 25 },
        { id: 3, name: 'Bob', age: 20 },
        { id: 4, name: 'Eve', age: null },
      ]);
    });
  });
  describe('Test Sorting by a String Field ', () => {
    test('sorts data by name in ascending order', () => {
      const result = sortData({
        dataSource: testData,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result).toEqual([
        { id: 2, name: 'Alice', age: 30 },
        { id: 3, name: 'Bob', age: 20 },
        { id: 4, name: 'Eve', age: null },
        { id: 1, name: 'John', age: 25 },
      ]);
    });

    test('sorts data by name in descending order', () => {
      const result = sortData({
        dataSource: testData,
        sortBy: 'name',
        sortOrder: 'desc',
      });

      expect(result).toEqual([
        { id: 1, name: 'John', age: 25 },
        { id: 4, name: 'Eve', age: null },
        { id: 3, name: 'Bob', age: 20 },
        { id: 2, name: 'Alice', age: 30 },
      ]);
    });
  });
  describe('Test Handling of null or undefined Values', () => {
    test('handles null or undefined values by pushing them to the end', () => {
      const result = sortData({
        dataSource: testData,
        sortBy: 'age',
        sortOrder: 'asc',
      });

      expect(result[result.length - 1]).toEqual({
        id: 4,
        name: 'Eve',
        age: null,
      });
    });
  });
  describe('Test When sortBy or sortOrder is Missing', () => {
    test('returns original data when sortBy is missing', () => {
      const result = sortData({
        dataSource: testData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentionally passing an invalid type to test missing-arg handling
        sortBy: null as any,
      });

      expect(result).toEqual(testData);
    });

    test('returns original data when sortOrder is missing', () => {
      const result = sortData({
        dataSource: testData,
        sortBy: 'name',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentionally passing an invalid type to test missing-arg handling
        sortOrder: null as any,
      });

      expect(result).toEqual(testData);
    });
  });
});
