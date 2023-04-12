import type { BasicStoreEntity, StoreEntity } from '../../../types/store';
import type { StixDomainObject, StixOpenctiExtensionSDO } from '../../../types/stix-common';
import { STIX_EXT_OCTI } from '../../../types/stix-extensions';

export const ENTITY_TYPE_CONTAINER_CASE_RFT = 'Case-Rft';

export interface BasicStoreEntityCaseRft extends BasicStoreEntity {
  name: string,
  description: string,
  severity: string,
  priority: string,
  response_types: string,
  object_refs: Array<string>,
}

export interface StoreEntityCaseRft extends StoreEntity {
  name: string,
  severity: string,
  priority: string,
  description: string,
  object_refs: Array<string>,
  response_types: string,
}

export interface StixCaseRft extends StixDomainObject {
  name: string,
  description: string,
  severity: string,
  priority: string,
  object_refs: Array<string>,
  response_types: string,
  extensions: {
    [STIX_EXT_OCTI] : StixOpenctiExtensionSDO
  }
}
