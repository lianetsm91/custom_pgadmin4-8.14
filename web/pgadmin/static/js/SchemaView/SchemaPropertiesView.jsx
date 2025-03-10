/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2024, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import React, { useEffect, useMemo } from 'react';

import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/InfoRounded';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import PropTypes from 'prop-types';

import gettext from 'sources/gettext';
import { PgIconButton, PgButtonGroup } from 'sources/components/Buttons';
import CustomPropTypes from 'sources/custom_prop_types';
import { SaveButton } from './SaveButton';
import { FieldControl } from './FieldControl';
import { FormLoader } from './FormLoader';
import { SchemaStateContext } from './SchemaState';
import { StyledBox } from './StyledComponents';
import { useSchemaState } from './hooks';
import { createFieldControls } from './utils';

import { ErrorMessageBox } from 'sources/components/FormComponents';

/* If its the properties tab */
export default function SchemaPropertiesView({
                                               getInitData,
                                               viewHelperProps,
                                               schema = {},
                                               checkDirtyOnEnableSave = false,
                                               ...props
                                             }) {
  // Schema data state manager
  const { schemaState, dataDispatch } = useSchemaState({
    schema: schema, getInitData: getInitData, immutableData: {},
    viewHelperProps: viewHelperProps, onDataChange: props.onDataChange,
  });

  const finalTabs = useMemo(
    () => createFieldControls({
      schema,
      schemaState,
      viewHelperProps,
      dataDispatch: dataDispatch,
      accessPath: []
    }),
    [schema._id, schemaState, viewHelperProps]
  );

  if (!finalTabs) return <></>;

  // Is saving operation in progress?
  const setSaving = (val) => schemaState.isSaving = val;
  const setLoaderText = (val) => schemaState.setMessage(val);

  const onSaveClick = () => {
    // Do nothing when there is no change or there is an error
    if(!schemaState._changes || Object.keys(schemaState._changes).length === 0 ||
      schemaState.errors.name
    ) return;

    setSaving(true);
    setLoaderText('Saving...');

    props.onSave(schemaState.isNew, schemaState.changes(true))
      .catch((err) => {
        schemaState.setError({
          name: 'apierror', message: _.escape(parseApiError(err)),
        });
      }).finally(() => {
      setSaving(false);
      setLoaderText('');
    });
  };

  return useMemo(
    () => <StyledBox>
      <SchemaStateContext.Provider value={schemaState}>
        <FormLoader/>
        <Box className='Properties-toolbar'>
          <PgButtonGroup size="small">
            <PgIconButton
              data-test="help" onClick={() => props.onHelp(true, false)}
              icon={<InfoIcon />} disabled={props.disableSqlHelp}
              title="SQL help for this object type." />
            <PgIconButton data-test="edit"
              onClick={props.onEdit} icon={<EditIcon />}
              title={gettext('Edit object...')} />
          </PgButtonGroup>
        </Box>
        <Box className={'Properties-form'}>
          <Box>
            {finalTabs.map((group)=>{
              let id = group.id.replace(' ', '');
              return (
                <Accordion key={id}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${id}-content`}
                    id={`${id}-header`}
                  >
                    {group.label}
                  </AccordionSummary>
                  <AccordionDetails className={group.className}>
                    <Box style={{ width: '100%' }}>
                      {group?.controls.map((item, idx) => (<FieldControl
                        item={item} key={idx} schemaId={schema._id} />)
                      )
                      }
                      {(group.id === 'security_group' || group.id === 'Security') && !viewHelperProps.inCatalog &&
                        (<Box display="flex" flexDirection="column"
                              alignItems="end">
                            <ErrorMessageBox style={{ position: 'static' }} />
                            <SaveButton
                              onClick={onSaveClick} icon={<SaveIcon />}
                              label={props.customSaveBtnName || gettext('Save')}
                              checkDirtyOnEnableSave={checkDirtyOnEnableSave}
                              mode={viewHelperProps.mode}
                            />
                          </Box>
                        )
                      }
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>
      </SchemaStateContext.Provider>
    </StyledBox>,
    [schema._id]
  );
}

SchemaPropertiesView.propTypes = {
  getInitData: PropTypes.func.isRequired,
  updatedData: PropTypes.object,
  viewHelperProps: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    serverInfo: PropTypes.shape({
      type: PropTypes.string,
      version: PropTypes.number,
    }),
    inCatalog: PropTypes.bool,
    keepCid: PropTypes.bool,
  }).isRequired,
  schema: CustomPropTypes.schemaUI,
  onHelp: PropTypes.func,
  disableSqlHelp: PropTypes.bool,
  onEdit: PropTypes.func,
  resetKey: PropTypes.any,
  itemNodeData: PropTypes.object
};

