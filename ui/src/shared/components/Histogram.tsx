// Libraries
import React, {useMemo, useEffect, SFC} from 'react'
import {connect} from 'react-redux'
import {AutoSizer} from 'react-virtualized'
import {
  Plot as MinardPlot,
  Histogram as MinardHistogram,
  ColumnType,
} from 'src/minard'

// Components
import HistogramTooltip from 'src/shared/components/HistogramTooltip'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Actions
import {tableLoaded} from 'src/timeMachine/actions'

// Utils
import {toMinardTable} from 'src/shared/utils/toMinardTable'
import {useOneWayState} from 'src/shared/utils/useOneWayState'

// Constants
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {FluxTable} from 'src/types'
import {HistogramView} from 'src/types/v2/dashboards'

interface DispatchProps {
  onTableLoaded: typeof tableLoaded
}

interface OwnProps {
  tables: FluxTable[]
  properties: HistogramView
}

type Props = OwnProps & DispatchProps

const Histogram: SFC<Props> = props => {
  const {tables, onTableLoaded} = props
  const {
    xColumn,
    fillColumns,
    binCount,
    position,
    colors,
    xDomain: defaultXDomain,
  } = props.properties
  const colorHexes = colors.map(c => c.hex)

  const toMinardTableResult = useMemo(() => toMinardTable(tables), [tables])

  useEffect(
    () => {
      onTableLoaded(toMinardTableResult)
    },
    [toMinardTableResult]
  )

  const {table} = toMinardTableResult

  // The view properties object stores `xColumn` and `fillColumns` fields that
  // are used as parameters for the visualization, but they may be invalid if
  // the retrieved data for the view has just changed (e.g. if a user has
  // changed their query). In this case, the `TABLE_LOADED` action will emit
  // from the above effect and the stored fields will be updated appropriately,
  // but we still have to be defensive about accessing those fields since the
  // component will render before the field resolution takes place.
  let x: string
  let fill: string[]

  if (table.columns[xColumn] && table.columnTypes[x] === ColumnType.Numeric) {
    x = xColumn
  } else {
    x = Object.entries(table.columnTypes)
      .filter(([__, type]) => type === ColumnType.Numeric)
      .map(([name]) => name)[0]
  }

  if (fillColumns) {
    fill = fillColumns.filter(name => table.columns[name])
  } else {
    fill = []
  }

  const [xDomain, setXDomain] = useOneWayState(defaultXDomain)

  if (!x) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  return (
    <AutoSizer>
      {({width, height}) => (
        <MinardPlot
          table={table}
          width={width}
          height={height}
          xDomain={xDomain}
          onSetXDomain={setXDomain}
        >
          {env => (
            <MinardHistogram
              env={env}
              x={x}
              fill={fill}
              binCount={binCount}
              position={position}
              tooltip={HistogramTooltip}
              colors={colorHexes}
            />
          )}
        </MinardPlot>
      )}
    </AutoSizer>
  )
}

const mdtp = {
  onTableLoaded: tableLoaded,
}

export default connect<{}, DispatchProps, OwnProps>(
  null,
  mdtp
)(Histogram)
