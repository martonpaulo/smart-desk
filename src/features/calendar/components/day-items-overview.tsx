'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDayItems } from '@/features/calendar/hooks/use-day-items';
import type { DayItem } from '@/features/calendar/types/day-item';
import { DATE_LOCALE_BY_LANGUAGE, toSupportedLanguage } from '@/features/i18n/constants/languages';
import { cn } from '@/lib/utils';

const DEFAULT_CALENDAR_COLOR = '#9aa0a6';
const SKELETON_ROWS_COUNT = 2;
const LOCAL_PLANNED_SOURCE = 'task';

interface ItemSectionProps {
  title: string;
  emptyLabel: string;
  items: DayItem[];
}

function getItemSignature(item: DayItem): string {
  return JSON.stringify({
    title: item.title,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    allDay: item.allDay,
    calendarColor: item.calendarColor,
    source: item.source,
    description: item.description,
    tags: item.tags,
    plannedDate: item.plannedDate,
  });
}

function getItemLabel(item: DayItem): string {
  return item.title.trim();
}

function formatTimeLabel(isoDate: string, locale: string): string {
  return new Date(isoDate).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTodayLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function ItemSection({ title, emptyLabel, items }: ItemSectionProps) {
  const { t, i18n } = useTranslation();
  const selectedLanguage = toSupportedLanguage(i18n.resolvedLanguage);
  const dateLocale = DATE_LOCALE_BY_LANGUAGE[selectedLanguage];

  return (
    <section className="space-y-2 rounded-lg border p-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null}
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map(item => (
            <li
              key={item.id}
              className={cn('rounded-md border p-3', item.source === LOCAL_PLANNED_SOURCE && 'border-dashed')}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.calendarColor ?? DEFAULT_CALENDAR_COLOR }}
                />
                <div className="space-y-1">
                  <p className="font-medium">{getItemLabel(item) || t('calendar.untitledItem')}</p>
                  {item.allDay ? (
                    <p className="text-sm text-muted-foreground">{t('calendar.allDayLabel')}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {formatTimeLabel(item.startsAt, dateLocale)} - {formatTimeLabel(item.endsAt, dateLocale)}
                    </p>
                  )}
                  {item.source === LOCAL_PLANNED_SOURCE && item.tags ? (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tagValue => (
                        <span
                          key={`${item.id}-${tagValue}`}
                          className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                        >
                          {tagValue}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {item.source === LOCAL_PLANNED_SOURCE && item.description ? (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function DayItemsOverview() {
  const { t, i18n } = useTranslation();
  const { data: items = [], isLoading, isFetched } = useDayItems();
  const previousItemsRef = useRef<Map<string, { signature: string; label: string }> | null>(null);
  const selectedLanguage = toSupportedLanguage(i18n.resolvedLanguage);
  const dateLocale = DATE_LOCALE_BY_LANGUAGE[selectedLanguage];
  const todayLabel = formatTodayLabel(new Date(), dateLocale);

  const { allDayItems, scheduledItems } = useMemo(() => {
    const groupedItems = {
      allDayItems: [] as DayItem[],
      scheduledItems: [] as DayItem[],
    };

    for (const item of items) {
      if (item.allDay) {
        groupedItems.allDayItems.push(item);
      } else {
        groupedItems.scheduledItems.push(item);
      }
    }

    return groupedItems;
  }, [items]);

  useEffect(() => {
    if (!isFetched) {
      return;
    }

    const currentItems = new Map(
      items.map(item => [item.id, { signature: getItemSignature(item), label: getItemLabel(item) }]),
    );

    const previousItems = previousItemsRef.current;
    if (!previousItems) {
      previousItemsRef.current = currentItems;
      return;
    }

    for (const [itemId, currentItem] of currentItems) {
      const previousItem = previousItems.get(itemId);
      if (!previousItem) {
        toast.info(t('calendar.toasts.added', { label: currentItem.label }));
        continue;
      }

      if (previousItem.signature !== currentItem.signature) {
        toast.info(t('calendar.toasts.updated', { label: currentItem.label }));
      }
    }

    for (const [itemId, previousItem] of previousItems) {
      if (!currentItems.has(itemId)) {
        toast.info(t('calendar.toasts.removed', { label: previousItem.label }));
      }
    }

    previousItemsRef.current = currentItems;
  }, [isFetched, items, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('calendar.todayTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">{todayLabel}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <ul className="space-y-2">
            {Array.from({ length: SKELETON_ROWS_COUNT }, (_, index) => (
              <li
                key={`item-skeleton-${index}`}
                aria-hidden
                className="rounded-md border p-3 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-muted" />
                  <div className="w-full space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {!isLoading ? (
          <>
            <ItemSection
              emptyLabel={t('calendar.emptyAllDay')}
              items={allDayItems}
              title={t('calendar.sectionAllDay')}
            />
            <ItemSection
              emptyLabel={t('calendar.emptyScheduled')}
              items={scheduledItems}
              title={t('calendar.sectionScheduled')}
            />
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('calendar.emptyStateHint')}</p>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
