import { useEffect, useState } from 'react';

import { defaultColumns } from 'src/features/column/config/defaultColumns';
import { useDefaultColumns } from 'src/legacy/hooks/useDefaultColumns';
import { Column } from 'src/legacy/types/column';

type ColumnKey = keyof typeof defaultColumns;

export function useDefaultColumnObj(key: ColumnKey) {
  const columnPromise = useDefaultColumns(key);
  const [column, setColumn] = useState<Column | undefined>();

  useEffect(() => {
    let cancelled = false;
    columnPromise
      .then(col => {
        if (!cancelled) setColumn(col);
      })
      .catch(err => {
        console.error('[useDefaultColumnObj] init failed', err);
      });
    return () => {
      cancelled = true;
    };
  }, [columnPromise]);

  return column;
}
