/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Upload, type UploadFile } from '@tigercat/react';
import { expectNoA11yViolations } from '../utils/react';

describe('Upload', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Upload />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Select File');
    });

    it('should render with custom children', () => {
      const { getByText } = render(<Upload>Custom Upload Button</Upload>);

      expect(getByText('Custom Upload Button')).toBeInTheDocument();
    });

    it('should render drag area when drag prop is true', () => {
      const { container } = render(<Upload drag />);

      const dragArea = container.querySelector('[role="button"]');
      expect(dragArea).toBeInTheDocument();
      expect(dragArea).toHaveTextContent('Click to upload');
      expect(dragArea).toHaveTextContent('or drag and drop');
    });

    it('should show accept info in drag area', () => {
      const { container } = render(<Upload drag accept="image/*" />);

      expect(container).toHaveTextContent('Accepted: image/*');
    });

    it('should show max size info in drag area', () => {
      const { container } = render(<Upload drag maxSize={5 * 1024 * 1024} />);

      expect(container).toHaveTextContent('Max size: 5.00 MB');
    });

    it('should apply custom className', () => {
      const { container } = render(<Upload className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should set accept attribute on input', () => {
      const { container } = render(<Upload accept="image/*" />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'image/*');
    });

    it('should set multiple attribute when multiple is true', () => {
      const { container } = render(<Upload multiple />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('multiple');
    });

    it('should disable input when disabled is true', () => {
      const { container } = render(<Upload disabled />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toBeDisabled();
    });

    it('should hide file list when showFileList is false', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
        },
      ];
      const { container } = render(
        <Upload fileList={fileList} showFileList={false} />
      );

      const list = container.querySelector('[role="list"]');
      expect(list).not.toBeInTheDocument();
    });
  });

  describe('Events', () => {
    it('should call onChange when file is selected', async () => {
      const onChange = vi.fn();
      const { container } = render(<Upload onChange={onChange} />);

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('should call onRemove when file is removed', async () => {
      const onRemove = vi.fn();
      const onChange = vi.fn();
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
        },
      ];
      const { container } = render(
        <Upload fileList={fileList} onRemove={onRemove} onChange={onChange} />
      );

      const removeButton = container.querySelector(
        '[aria-label*="Remove"]'
      ) as HTMLButtonElement;
      await userEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
    });

    it('should accumulate multiple selected files into fileList', async () => {
      const onChange = vi.fn();
      const { container } = render(
        <Upload multiple fileList={[]} onChange={onChange} />
      );

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
      const file2 = new File(['b'], 'b.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });

      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      const lastFileList = lastCall?.[1] as UploadFile[];
      expect(lastFileList).toHaveLength(2);
      expect(lastFileList.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
    });

    it('should call onExceed when file limit is exceeded', async () => {
      const onExceed = vi.fn();
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test1.jpg',
          status: 'success',
        },
      ];
      const { container } = render(
        <Upload fileList={fileList} limit={1} onExceed={onExceed} />
      );

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test2.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        expect(onExceed).toHaveBeenCalled();
      });
    });

    it('should call onPreview when preview button is clicked in picture-card mode', async () => {
      const onPreview = vi.fn();
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
          url: 'https://example.com/test.jpg',
        },
      ];
      const { container } = render(
        <Upload
          fileList={fileList}
          listType="picture-card"
          onPreview={onPreview}
        />
      );

      const previewButton = container.querySelector(
        '[aria-label*="Preview"]'
      ) as HTMLButtonElement;
      await userEvent.click(previewButton);

      expect(onPreview).toHaveBeenCalled();
    });
  });

  describe('File Validation', () => {
    it('should validate file type', async () => {
      const consoleWarn = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const { container } = render(<Upload accept="image/*" />);

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith(
          expect.stringContaining('type is not accepted')
        );
      });

      consoleWarn.mockRestore();
    });

    it('should validate file size', async () => {
      const consoleWarn = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const { container } = render(<Upload maxSize={50} />);

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      // Create content that's definitely larger than 50 bytes
      const largeContent = 'x'.repeat(100);
      const file = new File([largeContent], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith(
          expect.stringContaining('exceeds maximum size')
        );
      });

      consoleWarn.mockRestore();
    });

    it('should prevent upload when beforeUpload returns false', async () => {
      const beforeUpload = vi.fn(() => false);
      const onChange = vi.fn();
      const { container } = render(
        <Upload beforeUpload={beforeUpload} onChange={onChange} />
      );

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        expect(beforeUpload).toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('List Types', () => {
    it('should render text list by default', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);

      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
    });

    it('should render picture card list when listType is picture-card', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
          url: 'https://example.com/test.jpg',
        },
      ];
      const { container } = render(
        <Upload fileList={fileList} listType="picture-card" />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/test.jpg');
    });
  });

  describe('States', () => {
    it('should show disabled state on button', () => {
      const { container } = render(<Upload disabled />);

      const button = container.querySelector('button');
      expect(button).toBeDisabled();
    });

    it('should show disabled state on drag area', () => {
      const { container } = render(<Upload drag disabled />);

      const dragArea = container.querySelector('[role="button"]');
      expect(dragArea).toHaveAttribute('aria-disabled', 'true');
      expect(dragArea).toHaveAttribute('tabindex', '-1');
    });

    it('should display success status icon', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);

      const successIcon = container.querySelector('[aria-label="Success"]');
      expect(successIcon).toBeInTheDocument();
    });

    it('should display error status icon', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'error',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);

      const errorIcon = container.querySelector('[aria-label="Error"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should display uploading status icon', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'uploading',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);

      const uploadingIcon = container.querySelector('[aria-label="Uploading"]');
      expect(uploadingIcon).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag over event', async () => {
      const { container } = render(<Upload drag />);

      const dragArea = container.querySelector(
        '[role="button"]'
      ) as HTMLElement;

      await fireEvent.dragOver(dragArea);

      // Should add dragging state classes
      expect(dragArea.className).toContain('border-');
    });

    it('should handle drop event', async () => {
      const onChange = vi.fn();
      const { container } = render(<Upload drag onChange={onChange} />);

      const dragArea = container.querySelector(
        '[role="button"]'
      ) as HTMLElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      const dataTransfer = {
        files: [file],
      };

      await fireEvent.drop(dragArea, { dataTransfer });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('should not handle drag events when disabled', async () => {
      const { container } = render(<Upload drag disabled />);

      const dragArea = container.querySelector(
        '[role="button"]'
      ) as HTMLElement;
      const initialClassName = dragArea.className;

      await fireEvent.dragOver(dragArea);

      // Should not change state
      expect(dragArea.className).toBe(initialClassName);
    });
  });

  describe('Controlled and Uncontrolled', () => {
    it('should work in uncontrolled mode', async () => {
      const { container } = render(<Upload />);

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        const fileList = container.querySelector('[role="list"]');
        expect(fileList).toBeInTheDocument();
      });
    });

    it('should work in controlled mode', async () => {
      const TestComponent = () => {
        const [fileList, setFileList] = React.useState<UploadFile[]>([]);

        const handleChange = (_file: UploadFile, newList: UploadFile[]) => {
          setFileList(newList);
        };

        return <Upload fileList={fileList} onChange={handleChange} />;
      };

      const { container } = render(<TestComponent />);

      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await fireEvent.change(input);

      await waitFor(() => {
        const fileList = container.querySelector('[role="list"]');
        expect(fileList).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on upload button', () => {
      const { container } = render(<Upload />);

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Upload file');
    });

    it('should have proper ARIA attributes on drag area', () => {
      const { container } = render(<Upload drag />);

      const dragArea = container.querySelector('[role="button"]');
      expect(dragArea).toHaveAttribute('role', 'button');
      expect(dragArea).toHaveAttribute(
        'aria-label',
        'Upload file by clicking or dragging'
      );
      expect(dragArea).toHaveAttribute('tabindex', '0');
    });

    it('should have proper ARIA attributes on file list', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);

      const list = container.querySelector('[role="list"]');
      expect(list).toHaveAttribute('aria-label', 'Uploaded files');
    });

    it('should have descriptive aria-label on remove button', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);

      const removeButton = container.querySelector('[aria-label*="Remove"]');
      expect(removeButton).toHaveAttribute('aria-label', 'Remove test.jpg');
    });

    it('should pass accessibility checks', async () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);

      await expectNoA11yViolations(container);
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(<Upload />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with drag mode', () => {
      const { container } = render(
        <Upload drag accept="image/*" maxSize={5 * 1024 * 1024} />
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with file list', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test1.jpg',
          status: 'success',
          size: 1024,
        },
        {
          uid: 'file-2',
          name: 'test2.png',
          status: 'uploading',
          progress: 50,
        },
        {
          uid: 'file-3',
          name: 'test3.pdf',
          status: 'error',
          error: 'Upload failed',
        },
      ];
      const { container } = render(<Upload fileList={fileList} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with picture-card list type', () => {
      const fileList: UploadFile[] = [
        {
          uid: 'file-1',
          name: 'test.jpg',
          status: 'success',
          url: 'https://example.com/test.jpg',
        },
      ];
      const { container } = render(
        <Upload fileList={fileList} listType="picture-card" />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
