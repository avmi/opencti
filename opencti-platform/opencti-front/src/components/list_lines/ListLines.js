import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, map, toPairs } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import {
  ArrowDropDown,
  ArrowDropUp,
  TableChart,
  Dashboard,
} from '@material-ui/icons';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import { FileExportOutline } from 'mdi-material-ui';
import { QueryRenderer } from '../../relay/environment';
import SearchInput from '../SearchInput';
import inject18n from '../i18n';
import StixDomainEntitiesExports, {
  stixDomainEntitiesExportsQuery,
} from '../../private/components/common/stix_domain_entities/StixDomainEntitiesExports';

const styles = (theme) => ({
  container: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  containerOpenExports: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 310,
  },
  parameters: {
    float: 'left',
    marginTop: -10,
  },
  views: {
    float: 'right',
  },
  linesContainer: {
    margin: '10px 0 0 0',
    padding: 0,
  },
  linesContainerBottomNav: {
    margin: '10px 0 90px 0',
    padding: 0,
  },
  item: {
    paddingLeft: 10,
    textTransform: 'uppercase',
  },
  sortIcon: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  headerItem: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
  sortableHeaderItem: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
    cursor: 'pointer',
  },
  filters: {
    float: 'left',
    margin: '2px 0 0 10px',
  },
});

class ListLines extends Component {
  reverseBy(field) {
    this.props.handleSort(field, !this.props.orderAsc);
  }

  renderHeaderElement(field, label, width, isSortable) {
    const {
      classes, t, sortBy, orderAsc,
    } = this.props;
    if (isSortable) {
      const orderComponent = orderAsc ? (
        <ArrowDropDown classes={{ root: classes.sortIcon }} />
      ) : (
        <ArrowDropUp classes={{ root: classes.sortIcon }} />
      );
      return (
        <div
          key={field}
          className={classes.sortableHeaderItem}
          style={{ width }}
          onClick={this.reverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {sortBy === field ? orderComponent : ''}
        </div>
      );
    }
    return (
      <div className={classes.headerItem} style={{ width }} key={field}>
        <span>{t(label)}</span>
      </div>
    );
  }

  render() {
    const {
      t,
      classes,
      handleSearch,
      handleChangeView,
      handleRemoveFilter,
      handleToggleExports,
      openExports,
      dataColumns,
      secondaryAction,
      paginationOptions,
      keyword,
      filters,
      bottomNav,
      children,
      exportEntityType,
    } = this.props;
    return (
      <div
        className={
          openExports ? classes.containerOpenExports : classes.container
        }
      >
        <div className={classes.parameters}>
          {typeof handleSearch === 'function' ? (
            <div style={{ float: 'left', marginRight: 20 }}>
              <SearchInput
                variant="small"
                onSubmit={handleSearch.bind(this)}
                keyword={keyword}
              />
            </div>
          ) : (
            ''
          )}
          <div className={classes.filters}>
            {map(
              (filter) => map(
                (f) => (
                    <Chip
                      key={filter[0]}
                      classes={{ root: classes.filter }}
                      label={`${filter[0]}: ${
                        f.value === null ? t('No tag') : f.value
                      }`}
                      onDelete={handleRemoveFilter.bind(this, filter[0])}
                    />
                ),
                filter[1],
              ),
              toPairs(filters),
            )}
          </div>
        </div>
        <div className={classes.views}>
          <div style={{ float: 'right', marginTop: -20 }}>
            {typeof handleChangeView === 'function' ? (
              <Tooltip title={t('Cards view')}>
                <IconButton
                  color="primary"
                  classes={{ root: classes.button }}
                  onClick={handleChangeView.bind(this, 'cards')}
                >
                  <Dashboard />
                </IconButton>
              </Tooltip>
            ) : (
              ''
            )}
            {typeof handleChangeView === 'function' ? (
              <Tooltip title={t('Lines view')}>
                <IconButton
                  color="secondary"
                  classes={{ root: classes.button }}
                  onClick={handleChangeView.bind(this, 'lines')}
                >
                  <TableChart />
                </IconButton>
              </Tooltip>
            ) : (
              ''
            )}
            {typeof handleToggleExports === 'function' ? (
              <Tooltip title={t('Exports panel')}>
                <IconButton
                  color={openExports ? 'secondary' : 'primary'}
                  onClick={handleToggleExports.bind(this)}
                >
                  <FileExportOutline />
                </IconButton>
              </Tooltip>
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="clearfix" />
        <List
          classes={{
            root: bottomNav
              ? classes.linesContainerBottomNav
              : classes.linesContainer,
          }}
        >
          <ListItem
            classes={{ root: classes.item }}
            divider={false}
            style={{ paddingTop: 0 }}
          >
            <ListItemIcon>
              <span
                style={{
                  padding: '0 8px 0 8px',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                &nbsp;
              </span>
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  {toPairs(dataColumns).map((dataColumn) => this.renderHeaderElement(
                    dataColumn[0],
                    dataColumn[1].label,
                    dataColumn[1].width,
                    dataColumn[1].isSortable,
                  ))}
                </div>
              }
            />
            {secondaryAction ? (
              <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
            ) : (
              ''
            )}
          </ListItem>
          {children}
        </List>
        {typeof handleToggleExports === 'function' ? (
          <QueryRenderer
            query={stixDomainEntitiesExportsQuery}
            variables={{ count: 25, type: exportEntityType }}
            render={({ props }) => (
              <StixDomainEntitiesExports
                open={openExports}
                handleToggle={handleToggleExports.bind(this)}
                data={props}
                paginationOptions={paginationOptions}
                exportEntityType={exportEntityType}
              />
            )}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}

ListLines.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  children: PropTypes.object,
  handleSearch: PropTypes.func,
  handleSort: PropTypes.func.isRequired,
  handleChangeView: PropTypes.func,
  handleRemoveFilter: PropTypes.func,
  handleToggleExports: PropTypes.func,
  openExports: PropTypes.bool,
  views: PropTypes.array,
  exportEntityType: PropTypes.string,
  keyword: PropTypes.string,
  filters: PropTypes.object,
  sortBy: PropTypes.string,
  orderAsc: PropTypes.bool.isRequired,
  dataColumns: PropTypes.object.isRequired,
  paginationOptions: PropTypes.object,
  secondaryAction: PropTypes.bool,
  bottomNav: PropTypes.bool,
};

export default compose(inject18n, withStyles(styles))(ListLines);
