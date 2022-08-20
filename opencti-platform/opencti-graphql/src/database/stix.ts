import * as R from 'ramda';
import { version as uuidVersion } from 'uuid';
import uuidTime from 'uuid-time';
import {
  ENTITY_TYPE_ATTACK_PATTERN,
  ENTITY_TYPE_CAMPAIGN,
  ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
  ENTITY_TYPE_COURSE_OF_ACTION,
  ENTITY_TYPE_IDENTITY_INDIVIDUAL,
  ENTITY_TYPE_IDENTITY_ORGANIZATION,
  ENTITY_TYPE_IDENTITY_SECTOR,
  ENTITY_TYPE_IDENTITY_SYSTEM,
  ENTITY_TYPE_INCIDENT,
  ENTITY_TYPE_INDICATOR,
  ENTITY_TYPE_INFRASTRUCTURE,
  ENTITY_TYPE_INTRUSION_SET,
  ENTITY_TYPE_LOCATION_CITY,
  ENTITY_TYPE_LOCATION_COUNTRY,
  ENTITY_TYPE_LOCATION_POSITION,
  ENTITY_TYPE_LOCATION_REGION,
  ENTITY_TYPE_MALWARE,
  ENTITY_TYPE_THREAT_ACTOR,
  ENTITY_TYPE_TOOL,
  ENTITY_TYPE_VULNERABILITY,
} from '../schema/stixDomainObject';
import {
  ENTITY_AUTONOMOUS_SYSTEM,
  ENTITY_DIRECTORY,
  ENTITY_DOMAIN_NAME,
  ENTITY_EMAIL_ADDR,
  ENTITY_EMAIL_MESSAGE,
  ENTITY_EMAIL_MIME_PART_TYPE,
  ENTITY_HASHED_OBSERVABLE_ARTIFACT,
  ENTITY_HASHED_OBSERVABLE_STIX_FILE,
  ENTITY_HOSTNAME,
  ENTITY_IPV4_ADDR,
  ENTITY_IPV6_ADDR,
  ENTITY_MAC_ADDR,
  ENTITY_NETWORK_TRAFFIC,
  ENTITY_PROCESS,
  ENTITY_SOFTWARE,
  ENTITY_URL,
  ENTITY_USER_ACCOUNT,
  ENTITY_WINDOWS_REGISTRY_KEY,
  ENTITY_WINDOWS_REGISTRY_VALUE_TYPE,
  isStixCyberObservable,
} from '../schema/stixCyberObservable';
import {
  RELATION_ATTRIBUTED_TO,
  RELATION_AUTHORED_BY,
  RELATION_BASED_ON,
  RELATION_BEACONS_TO,
  RELATION_BELONGS_TO,
  RELATION_COMMUNICATES_WITH,
  RELATION_COMPROMISES,
  RELATION_CONSISTS_OF,
  RELATION_CONTROLS,
  RELATION_COOPERATES_WITH,
  RELATION_DELIVERS,
  RELATION_DERIVED_FROM,
  RELATION_DOWNLOADS,
  RELATION_DROPS,
  RELATION_EXFILTRATES_TO,
  RELATION_EXPLOITS,
  RELATION_HAS,
  RELATION_HOSTS,
  RELATION_IMPERSONATES,
  RELATION_INDICATES,
  RELATION_INVESTIGATES,
  RELATION_LOCATED_AT,
  RELATION_MITIGATES,
  RELATION_ORIGINATES_FROM,
  RELATION_OWNS,
  RELATION_PART_OF,
  RELATION_PARTICIPATES_IN,
  RELATION_RELATED_TO,
  RELATION_REMEDIATES,
  RELATION_RESOLVES_TO,
  RELATION_REVOKED_BY,
  RELATION_SUBTECHNIQUE_OF,
  RELATION_TARGETS,
  RELATION_USES,
  RELATION_VARIANT_OF
} from '../schema/stixCoreRelationship';
import {
  RELATION_BCC,
  RELATION_BELONGS_TO as OBS_RELATION_BELONGS_TO,
  RELATION_BODY_MULTIPART,
  RELATION_BODY_RAW,
  RELATION_CC,
  RELATION_CHILD,
  RELATION_CONTAINS,
  RELATION_CONTENT as OBS_RELATION_CONTENT,
  RELATION_CREATOR_USER,
  RELATION_DST,
  RELATION_DST_PAYLOAD,
  RELATION_ENCAPSULATED_BY,
  RELATION_ENCAPSULATES,
  RELATION_FROM,
  RELATION_IMAGE,
  RELATION_LINKED,
  RELATION_OPENED_CONNECTION,
  RELATION_OPERATING_SYSTEM,
  RELATION_PARENT,
  RELATION_PARENT_DIRECTORY,
  RELATION_RAW_EMAIL,
  RELATION_RESOLVES_TO as OBS_RELATION_RESOLVES_TO,
  RELATION_SAMPLE,
  RELATION_SENDER,
  RELATION_SRC,
  RELATION_SRC_PAYLOAD,
  RELATION_TO,
  RELATION_VALUES,
  STIX_CYBER_OBSERVABLE_RELATION_TO_FIELD,
} from '../schema/stixCyberObservableRelationship';
import { ABSTRACT_STIX_CYBER_OBSERVABLE } from '../schema/general';

const MAX_TRANSIENT_STIX_IDS = 200;
export const STIX_SPEC_VERSION = '2.1';

export const onlyStableStixIds = (ids = []) => R.filter((n) => uuidVersion(R.split('--', n)[1]) !== 1, ids);

export const cleanStixIds = (ids: Array<string>, maxStixIds = MAX_TRANSIENT_STIX_IDS): Array<string> => {
  const keptIds = [];
  const transientIds = [];
  const wIds = Array.isArray(ids) ? ids : [ids];
  for (let index = 0; index < wIds.length; index += 1) {
    const stixId = wIds[index];
    const segments = stixId.split('--');
    const [, uuid] = segments;
    const isTransient = uuidVersion(uuid) === 1;
    if (isTransient) {
      const timestamp = uuidTime.v1(uuid);
      transientIds.push({ id: stixId, uuid, timestamp });
    } else {
      keptIds.push({ id: stixId, uuid });
    }
  }
  const orderedTransient = R.sort((a, b) => b.timestamp - a.timestamp, transientIds);
  const keptTimedIds = orderedTransient.length > maxStixIds ? orderedTransient.slice(0, maxStixIds) : orderedTransient;
  // Return the new list
  return R.map((s) => s.id, [...keptIds, ...keptTimedIds]);
};

export const stixCoreRelationshipsMapping = {
  [`${ENTITY_IPV4_ADDR}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_IPV4_ADDR}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_IPV4_ADDR}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_IPV4_ADDR}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_SUBTECHNIQUE_OF],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_MALWARE}`]: [RELATION_DELIVERS, RELATION_USES],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_TOOL}`]: [RELATION_USES],
  [`${ENTITY_TYPE_ATTACK_PATTERN}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_IDENTITY_SYSTEM}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [RELATION_COMPROMISES, RELATION_USES],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_INTRUSION_SET}`]: [RELATION_ATTRIBUTED_TO],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_MALWARE}`]: [RELATION_USES],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_THREAT_ACTOR}`]: [RELATION_ATTRIBUTED_TO],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_TOOL}`]: [RELATION_USES],
  [`${ENTITY_TYPE_CAMPAIGN}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_COURSE_OF_ACTION}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_MITIGATES],
  [`${ENTITY_TYPE_COURSE_OF_ACTION}_${ENTITY_TYPE_INDICATOR}`]: [RELATION_INVESTIGATES, RELATION_MITIGATES],
  [`${ENTITY_TYPE_COURSE_OF_ACTION}_${ENTITY_TYPE_MALWARE}`]: [RELATION_MITIGATES, RELATION_REMEDIATES],
  [`${ENTITY_TYPE_COURSE_OF_ACTION}_${ENTITY_TYPE_TOOL}`]: [RELATION_MITIGATES],
  [`${ENTITY_TYPE_COURSE_OF_ACTION}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_MITIGATES, RELATION_REMEDIATES],
  [`${ENTITY_TYPE_IDENTITY_INDIVIDUAL}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [RELATION_PART_OF],
  [`${ENTITY_TYPE_IDENTITY_INDIVIDUAL}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_PART_OF],
  [`${ENTITY_TYPE_IDENTITY_INDIVIDUAL}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_INDIVIDUAL}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_INDIVIDUAL}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_INDIVIDUAL}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_ORGANIZATION}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_PART_OF],
  [`${ENTITY_TYPE_IDENTITY_ORGANIZATION}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_PART_OF],
  [`${ENTITY_TYPE_IDENTITY_ORGANIZATION}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_ORGANIZATION}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_ORGANIZATION}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_ORGANIZATION}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_ORGANIZATION}_${ENTITY_TYPE_TOOL}`]: [RELATION_USES],
  [`${ENTITY_TYPE_IDENTITY_SECTOR}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_PART_OF],
  [`${ENTITY_TYPE_IDENTITY_SECTOR}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_SECTOR}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_SECTOR}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_SECTOR}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_IDENTITY_SYSTEM}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_BELONGS_TO],
  [`${ENTITY_TYPE_IDENTITY_SYSTEM}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_CAMPAIGN}`]: [RELATION_ATTRIBUTED_TO],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_IDENTITY_SYSTEM}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [RELATION_COMPROMISES, RELATION_USES],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_INTRUSION_SET}`]: [RELATION_ATTRIBUTED_TO],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_MALWARE}`]: [RELATION_USES],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_THREAT_ACTOR}`]: [RELATION_ATTRIBUTED_TO],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_TOOL}`]: [RELATION_USES],
  [`${ENTITY_TYPE_INCIDENT}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_HASHED_OBSERVABLE_ARTIFACT}`]: [RELATION_BASED_ON],
  [`${ENTITY_TYPE_INDICATOR}_${ABSTRACT_STIX_CYBER_OBSERVABLE}`]: [RELATION_BASED_ON],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_CAMPAIGN}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_CONTAINER_OBSERVED_DATA}`]: [RELATION_BASED_ON],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_INCIDENT}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_INDICATOR}`]: [RELATION_DERIVED_FROM],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_INTRUSION_SET}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_MALWARE}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_THREAT_ACTOR}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_TOOL}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INDICATOR}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_INDICATES],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_HASHED_OBSERVABLE_ARTIFACT}`]: [RELATION_CONSISTS_OF],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ABSTRACT_STIX_CYBER_OBSERVABLE}`]: [RELATION_CONSISTS_OF],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_DOMAIN_NAME}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_IPV4_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_IPV6_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_CONTAINER_OBSERVED_DATA}`]: [RELATION_CONSISTS_OF],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [
    RELATION_COMMUNICATES_WITH,
    RELATION_CONSISTS_OF,
    RELATION_CONTROLS,
    RELATION_USES,
  ],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_MALWARE}`]: [RELATION_CONTROLS, RELATION_DELIVERS, RELATION_HOSTS],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_TOOL}`]: [RELATION_HOSTS],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_HAS],
  [`${ENTITY_TYPE_INFRASTRUCTURE}_${ENTITY_URL}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_IDENTITY_SYSTEM}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [
    RELATION_COMPROMISES,
    RELATION_HOSTS,
    RELATION_OWNS,
    RELATION_USES,
  ],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_MALWARE}`]: [RELATION_USES],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_THREAT_ACTOR}`]: [RELATION_ATTRIBUTED_TO],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_TOOL}`]: [RELATION_USES],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_INTRUSION_SET}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [RELATION_USES],
  [`${ENTITY_TYPE_LOCATION_CITY}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_LOCATION_CITY}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_LOCATION_COUNTRY}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_LOCATION_POSITION}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_LOCATION_REGION}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_DOMAIN_NAME}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [
    RELATION_DOWNLOADS,
    RELATION_DROPS,
  ],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_IPV4_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_IPV6_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_IDENTITY_SYSTEM}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [
    RELATION_BEACONS_TO,
    RELATION_EXFILTRATES_TO,
    RELATION_TARGETS,
    RELATION_USES,
  ],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_INTRUSION_SET}`]: [RELATION_AUTHORED_BY],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_ORIGINATES_FROM, RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_MALWARE}`]: [
    RELATION_CONTROLS,
    RELATION_DOWNLOADS,
    RELATION_DROPS,
    RELATION_USES,
    RELATION_VARIANT_OF,
  ],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_THREAT_ACTOR}`]: [RELATION_AUTHORED_BY],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_TOOL}`]: [RELATION_DOWNLOADS, RELATION_DROPS, RELATION_USES],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_EXPLOITS, RELATION_TARGETS],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_URL}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_CAMPAIGN}`]: [RELATION_PARTICIPATES_IN],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [
    RELATION_ATTRIBUTED_TO,
    RELATION_IMPERSONATES,
    RELATION_TARGETS,
  ],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [
    RELATION_ATTRIBUTED_TO,
    RELATION_IMPERSONATES,
    RELATION_TARGETS,
  ],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [
    RELATION_COMPROMISES,
    RELATION_HOSTS,
    RELATION_OWNS,
    RELATION_USES,
  ],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT, RELATION_TARGETS],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT, RELATION_TARGETS],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT, RELATION_TARGETS],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT, RELATION_TARGETS],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_MALWARE}`]: [RELATION_USES],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_THREAT_ACTOR}`]: [RELATION_PART_OF, RELATION_COOPERATES_WITH],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_TOOL}`]: [RELATION_USES],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_THREAT_ACTOR}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [RELATION_USES],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_IDENTITY_INDIVIDUAL}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_IDENTITY_ORGANIZATION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_IDENTITY_SECTOR}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES, RELATION_DELIVERS, RELATION_DROPS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_INFRASTRUCTURE}`]: [RELATION_TARGETS, RELATION_USES],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_TARGETS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_MALWARE}`]: [RELATION_DELIVERS, RELATION_DROPS],
  [`${ENTITY_TYPE_TOOL}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_HAS, RELATION_TARGETS],
  [`${ENTITY_HOSTNAME}_${ENTITY_HASHED_OBSERVABLE_ARTIFACT}`]: [RELATION_DROPS],
  [`${ENTITY_HOSTNAME}_${ENTITY_TYPE_ATTACK_PATTERN}`]: [RELATION_USES],
  [`${ENTITY_HOSTNAME}_${ENTITY_DOMAIN_NAME}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HOSTNAME}_${ENTITY_IPV4_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HOSTNAME}_${ENTITY_IPV6_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HOSTNAME}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [RELATION_DROPS],
  // Observables / SDO Stix Core Relationships
  [`${ENTITY_IPV4_ADDR}_${ENTITY_MAC_ADDR}`]: [RELATION_RESOLVES_TO],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_MAC_ADDR}`]: [RELATION_RESOLVES_TO],
  [`${ENTITY_DOMAIN_NAME}_${ENTITY_DOMAIN_NAME}`]: [RELATION_RESOLVES_TO],
  [`${ENTITY_DOMAIN_NAME}_${ENTITY_IPV4_ADDR}`]: [RELATION_RESOLVES_TO],
  [`${ENTITY_DOMAIN_NAME}_${ENTITY_IPV6_ADDR}`]: [RELATION_RESOLVES_TO],
  [`${ENTITY_IPV4_ADDR}_${ENTITY_AUTONOMOUS_SYSTEM}`]: [RELATION_BELONGS_TO],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_AUTONOMOUS_SYSTEM}`]: [RELATION_BELONGS_TO],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [RELATION_DROPS, RELATION_DOWNLOADS],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [RELATION_DROPS, RELATION_DOWNLOADS],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_IPV4_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_IPV6_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_DOMAIN_NAME}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HASHED_OBSERVABLE_ARTIFACT}_${ENTITY_IPV4_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HASHED_OBSERVABLE_ARTIFACT}_${ENTITY_IPV6_ADDR}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HASHED_OBSERVABLE_ARTIFACT}_${ENTITY_DOMAIN_NAME}`]: [RELATION_COMMUNICATES_WITH],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_TARGETS],
  [`${ENTITY_SOFTWARE}_${ENTITY_TYPE_VULNERABILITY}`]: [RELATION_HAS],
  // DISCUSS IMPLEMENTATION!!
  [`${ENTITY_TYPE_INDICATOR}_${RELATION_USES}`]: [RELATION_INDICATES],
  [`${RELATION_TARGETS}_${ENTITY_TYPE_LOCATION_REGION}`]: [RELATION_LOCATED_AT],
  [`${RELATION_TARGETS}_${ENTITY_TYPE_LOCATION_COUNTRY}`]: [RELATION_LOCATED_AT],
  [`${RELATION_TARGETS}_${ENTITY_TYPE_LOCATION_CITY}`]: [RELATION_LOCATED_AT],
  [`${RELATION_TARGETS}_${ENTITY_TYPE_LOCATION_POSITION}`]: [RELATION_LOCATED_AT],
};

export const checkStixCoreRelationshipMapping = (fromType: string, toType: string, relationshipType: string): boolean => {
  if (relationshipType === RELATION_RELATED_TO || relationshipType === RELATION_REVOKED_BY) {
    return true;
  }
  if (isStixCyberObservable(toType)) {
    if (
      R.includes(`${fromType}_${ABSTRACT_STIX_CYBER_OBSERVABLE}`, R.keys(stixCoreRelationshipsMapping))
      && R.includes(relationshipType, stixCoreRelationshipsMapping[`${fromType}_${ABSTRACT_STIX_CYBER_OBSERVABLE}`])
    ) {
      return true;
    }
  }
  if (isStixCyberObservable(fromType)) {
    if (
      R.includes(`${ABSTRACT_STIX_CYBER_OBSERVABLE}_${toType}`, R.keys(stixCoreRelationshipsMapping))
      && R.includes(relationshipType, stixCoreRelationshipsMapping[`${ABSTRACT_STIX_CYBER_OBSERVABLE}_${toType}`])
    ) {
      return true;
    }
  }
  return R.includes(relationshipType, stixCoreRelationshipsMapping[`${fromType}_${toType}`] || []);
};

export const stixCyberObservableRelationshipsMapping = {
  [`${ENTITY_DIRECTORY}_${ENTITY_DIRECTORY}`]: [RELATION_CONTAINS],
  [`${ENTITY_DIRECTORY}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [RELATION_CONTAINS],
  [`${ENTITY_DOMAIN_NAME}_${ENTITY_DOMAIN_NAME}`]: [OBS_RELATION_RESOLVES_TO],
  [`${ENTITY_DOMAIN_NAME}_${ENTITY_IPV4_ADDR}`]: [OBS_RELATION_RESOLVES_TO],
  [`${ENTITY_DOMAIN_NAME}_${ENTITY_IPV6_ADDR}`]: [OBS_RELATION_RESOLVES_TO],
  [`${ENTITY_EMAIL_MESSAGE}_${ENTITY_EMAIL_ADDR}`]: [RELATION_FROM, RELATION_SENDER, RELATION_TO, RELATION_CC, RELATION_BCC],
  [`${ENTITY_EMAIL_ADDR}_${ENTITY_USER_ACCOUNT}`]: [OBS_RELATION_BELONGS_TO],
  [`${ENTITY_EMAIL_MIME_PART_TYPE}_${ENTITY_EMAIL_MESSAGE}`]: [RELATION_BODY_MULTIPART],
  [`${ENTITY_HASHED_OBSERVABLE_ARTIFACT}_${ENTITY_EMAIL_MESSAGE}`]: [RELATION_RAW_EMAIL],
  [`${ENTITY_HASHED_OBSERVABLE_ARTIFACT}_${ENTITY_EMAIL_MIME_PART_TYPE}`]: [RELATION_BODY_RAW],
  [`${ENTITY_HASHED_OBSERVABLE_ARTIFACT}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [OBS_RELATION_CONTENT],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_HASHED_OBSERVABLE_ARTIFACT}`]: [RELATION_SAMPLE],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [RELATION_SAMPLE],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ABSTRACT_STIX_CYBER_OBSERVABLE}`]: [RELATION_CONTAINS],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_DIRECTORY}`]: [RELATION_PARENT_DIRECTORY],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_EMAIL_MIME_PART_TYPE}`]: [RELATION_BODY_RAW],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_HASHED_OBSERVABLE_ARTIFACT}`]: [RELATION_CONTAINS],
  [`${ENTITY_HASHED_OBSERVABLE_STIX_FILE}_${ENTITY_PROCESS}`]: [RELATION_IMAGE],
  [`${ENTITY_IPV4_ADDR}_${ENTITY_AUTONOMOUS_SYSTEM}`]: [OBS_RELATION_BELONGS_TO],
  [`${ENTITY_IPV4_ADDR}_${ENTITY_MAC_ADDR}`]: [OBS_RELATION_RESOLVES_TO],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_AUTONOMOUS_SYSTEM}`]: [OBS_RELATION_BELONGS_TO],
  [`${ENTITY_IPV6_ADDR}_${ENTITY_MAC_ADDR}`]: [OBS_RELATION_RESOLVES_TO],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_HASHED_OBSERVABLE_ARTIFACT}`]: [RELATION_SRC_PAYLOAD, RELATION_DST_PAYLOAD],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_DOMAIN_NAME}`]: [RELATION_SRC, RELATION_DST],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_IPV4_ADDR}`]: [RELATION_SRC, RELATION_DST],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_IPV6_ADDR}`]: [RELATION_SRC, RELATION_DST],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_MAC_ADDR}`]: [RELATION_SRC, RELATION_DST],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_NETWORK_TRAFFIC}`]: [RELATION_ENCAPSULATES, RELATION_ENCAPSULATED_BY],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_NETWORK_TRAFFIC}`]: [RELATION_ENCAPSULATES, RELATION_ENCAPSULATED_BY],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_NETWORK_TRAFFIC}`]: [RELATION_ENCAPSULATES, RELATION_ENCAPSULATED_BY],
  [`${ENTITY_NETWORK_TRAFFIC}_${ENTITY_NETWORK_TRAFFIC}`]: [RELATION_ENCAPSULATES, RELATION_ENCAPSULATED_BY],
  [`${ENTITY_PROCESS}_${ENTITY_NETWORK_TRAFFIC}`]: [RELATION_OPENED_CONNECTION],
  [`${ENTITY_PROCESS}_${ENTITY_PROCESS}`]: [RELATION_PARENT, RELATION_CHILD],
  [`${ENTITY_TYPE_MALWARE}_${ENTITY_SOFTWARE}`]: [RELATION_OPERATING_SYSTEM],
  [`${ENTITY_TYPE_CONTAINER_OBSERVED_DATA}_${ENTITY_HASHED_OBSERVABLE_STIX_FILE}`]: [OBS_RELATION_CONTENT],
  [`${ENTITY_USER_ACCOUNT}_${ENTITY_PROCESS}`]: [RELATION_CREATOR_USER],
  [`${ENTITY_USER_ACCOUNT}_${ENTITY_WINDOWS_REGISTRY_KEY}`]: [RELATION_CREATOR_USER],
  [`${ENTITY_WINDOWS_REGISTRY_KEY}_${ENTITY_WINDOWS_REGISTRY_VALUE_TYPE}`]: [RELATION_VALUES]
};

export const stixCyberObservableTypeFields = () => {
  const entries = Object.entries(stixCyberObservableRelationshipsMapping);
  const typeFields: { [k: string]: Array<string> } = {};
  for (let index = 0; index < entries.length; index += 1) {
    const [fromTo, fields] = entries[index];
    const [fromType] = fromTo.split('_');
    const inputFields = fields.map((f) => STIX_CYBER_OBSERVABLE_RELATION_TO_FIELD[f]);
    if (typeFields[fromType]) {
      typeFields[fromType].push(...inputFields);
    } else {
      typeFields[fromType] = inputFields;
    }
  }
  return typeFields;
};

export const checkStixCyberObservableRelationshipMapping = (fromType: string, toType: string, relationshipType: string): boolean => {
  if (relationshipType === RELATION_LINKED || relationshipType === RELATION_LINKED) {
    return true;
  }
  return R.includes(relationshipType, stixCyberObservableRelationshipsMapping[`${fromType}_${toType}`] || []);
};
