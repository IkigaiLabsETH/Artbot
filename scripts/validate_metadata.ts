import { readFileSync } from 'fs';
import { join } from 'path';

interface ColorScheme {
  palette: string[];
  color_descriptions: string[];
}

interface StyleElements {
  core_symbols: string[];
  visual_elements: string[];
  philosophical_themes: string[];
  technical_approach: string[];
}

interface Composition {
  arrangement: string;
  focal_points: string[];
  spatial_relationships: string;
}

interface Technique {
  primary_method: string;
  materials: string[];
  special_effects: string[];
}

interface ArtisticAttributes {
  style_elements: StyleElements;
  color_scheme: ColorScheme;
  composition: Composition;
  technique: Technique;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
  display_type?: string;
}

interface FileInfo {
  uri: string;
  type: string;
}

interface Creator {
  address: string;
  share: number;
}

interface Collection {
  name: string;
  family: string;
}

interface Source {
  origin: string;
  license: string;
}

interface Properties {
  files: FileInfo[];
  category: string;
  creators: Creator[];
  collection: Collection;
  source: Source;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  animation_url: string;
  background_color: string;
  attributes: NFTAttribute[];
  artistic_attributes: ArtisticAttributes;
  properties: Properties;
  metadata_version: string;
  added_by: string;
  added_date: string;
}

interface MarketplaceRequirements {
  opensea: {
    name_length: number;
    description_length: number;
    required_attributes: string[];
    property_count: number;
  };
  foundation: {
    name_length: number;
    description_length: number;
    required_fields: string[];
  };
  rarible: {
    name_length: number;
    description_length: number;
    required_fields: string[];
  };
}

class MetadataValidator {
  private static readonly REQUIRED_FIELDS = [
    'name',
    'description',
    'image',
    'attributes',
    'artistic_attributes',
    'properties'
  ];

  private static readonly REQUIRED_ATTRIBUTES = [
    'Artist',
    'Year',
    'Category',
    'Style',
    'Subcategory'
  ];

  private static readonly COLOR_REGEX = /^#[0-9A-F]{6}$/i;

  private static readonly MARKETPLACE_REQUIREMENTS: MarketplaceRequirements = {
    opensea: {
      name_length: 60,
      description_length: 1000,
      required_attributes: ['Artist', 'Year', 'Category', 'Style', 'Subcategory', 'Rarity'],
      property_count: 20
    },
    foundation: {
      name_length: 50,
      description_length: 500,
      required_fields: ['name', 'description', 'image', 'animation_url', 'attributes']
    },
    rarible: {
      name_length: 100,
      description_length: 2000,
      required_fields: ['name', 'description', 'image', 'attributes', 'properties']
    }
  };

  static validateMetadata(metadata: NFTMetadata): string[] {
    let errors: string[] = [];

    // Basic metadata validation
    errors = errors.concat(this.validateBasicMetadata(metadata));

    // Marketplace-specific validation
    errors = errors.concat(this.validateOpenSea(metadata));
    errors = errors.concat(this.validateFoundation(metadata));
    errors = errors.concat(this.validateRarible(metadata));

    return errors;
  }

  private static validateBasicMetadata(metadata: NFTMetadata): string[] {
    const errors: string[] = [];

    // Check required fields
    this.REQUIRED_FIELDS.forEach(field => {
      if (!metadata[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate image URI format
    if (!metadata.image.startsWith('ipfs://')) {
      errors.push('Image URI must use IPFS protocol');
    }

    // Validate attributes
    const attributeTypes = metadata.attributes.map(attr => attr.trait_type);
    this.REQUIRED_ATTRIBUTES.forEach(attr => {
      if (!attributeTypes.includes(attr)) {
        errors.push(`Missing required attribute: ${attr}`);
      }
    });

    // Validate color scheme
    const { color_scheme } = metadata.artistic_attributes;
    if (color_scheme.palette.length !== color_scheme.color_descriptions.length) {
      errors.push('Color palette and descriptions must have matching lengths');
    }
    color_scheme.palette.forEach(color => {
      if (!this.COLOR_REGEX.test(color)) {
        errors.push(`Invalid color format: ${color}`);
      }
    });

    // Validate style elements
    const { style_elements } = metadata.artistic_attributes;
    if (style_elements.core_symbols.length === 0) {
      errors.push('Must include at least one core symbol');
    }
    if (style_elements.visual_elements.length === 0) {
      errors.push('Must include at least one visual element');
    }

    // Validate properties
    const { properties } = metadata;
    if (properties.files.length === 0) {
      errors.push('Must include at least one file');
    }
    if (properties.creators.reduce((sum, creator) => sum + creator.share, 0) !== 100) {
      errors.push('Creator shares must sum to 100');
    }

    // Validate dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(metadata.added_date)) {
      errors.push('Invalid date format (should be YYYY-MM-DD)');
    }

    return errors;
  }

  private static validateOpenSea(metadata: NFTMetadata): string[] {
    const errors: string[] = [];
    const { name, description, attributes } = metadata;

    // Name length validation
    if (name.length > this.MARKETPLACE_REQUIREMENTS.opensea.name_length) {
      errors.push(`OpenSea: Name must be ${this.MARKETPLACE_REQUIREMENTS.opensea.name_length} characters or less`);
    }

    // Description length validation
    if (description.length > this.MARKETPLACE_REQUIREMENTS.opensea.description_length) {
      errors.push(`OpenSea: Description must be ${this.MARKETPLACE_REQUIREMENTS.opensea.description_length} characters or less`);
    }

    // Required attributes validation
    const attributeTypes = attributes.map(attr => attr.trait_type);
    this.MARKETPLACE_REQUIREMENTS.opensea.required_attributes.forEach(attr => {
      if (!attributeTypes.includes(attr)) {
        errors.push(`OpenSea: Missing required attribute: ${attr}`);
      }
    });

    // Property count validation
    if (attributes.length > this.MARKETPLACE_REQUIREMENTS.opensea.property_count) {
      errors.push(`OpenSea: Maximum ${this.MARKETPLACE_REQUIREMENTS.opensea.property_count} properties allowed`);
    }

    return errors;
  }

  private static validateFoundation(metadata: NFTMetadata): string[] {
    const errors: string[] = [];
    const { name, description } = metadata;

    // Name length validation
    if (name.length > this.MARKETPLACE_REQUIREMENTS.foundation.name_length) {
      errors.push(`Foundation: Name must be ${this.MARKETPLACE_REQUIREMENTS.foundation.name_length} characters or less`);
    }

    // Description length validation
    if (description.length > this.MARKETPLACE_REQUIREMENTS.foundation.description_length) {
      errors.push(`Foundation: Description must be ${this.MARKETPLACE_REQUIREMENTS.foundation.description_length} characters or less`);
    }

    // Required fields validation
    this.MARKETPLACE_REQUIREMENTS.foundation.required_fields.forEach(field => {
      if (!metadata[field]) {
        errors.push(`Foundation: Missing required field: ${field}`);
      }
    });

    return errors;
  }

  private static validateRarible(metadata: NFTMetadata): string[] {
    const errors: string[] = [];
    const { name, description } = metadata;

    // Name length validation
    if (name.length > this.MARKETPLACE_REQUIREMENTS.rarible.name_length) {
      errors.push(`Rarible: Name must be ${this.MARKETPLACE_REQUIREMENTS.rarible.name_length} characters or less`);
    }

    // Description length validation
    if (description.length > this.MARKETPLACE_REQUIREMENTS.rarible.description_length) {
      errors.push(`Rarible: Description must be ${this.MARKETPLACE_REQUIREMENTS.rarible.description_length} characters or less`);
    }

    // Required fields validation
    this.MARKETPLACE_REQUIREMENTS.rarible.required_fields.forEach(field => {
      if (!metadata[field]) {
        errors.push(`Rarible: Missing required field: ${field}`);
      }
    });

    return errors;
  }

  static validateCatalog(catalogPath: string): void {
    try {
      const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
      let totalErrors = 0;

      Object.entries(catalog.categories).forEach(([category, data]: [string, any]) => {
        if (data.images) {
          data.images.forEach((image: NFTMetadata, index: number) => {
            const errors = this.validateMetadata(image);
            if (errors.length > 0) {
              console.error(`\nErrors in ${category} image ${index + 1} (${image.name}):`);
              errors.forEach(error => console.error(`- ${error}`));
              totalErrors += errors.length;
            }
          });
        }
      });

      if (totalErrors === 0) {
        console.log('\n✅ All metadata is valid!');
      } else {
        console.error(`\n❌ Found ${totalErrors} validation errors`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error reading or parsing catalog:', error);
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const catalogPath = join(__dirname, '../reference_images/catalog.json');
  MetadataValidator.validateCatalog(catalogPath);
}

export { MetadataValidator, NFTMetadata }; 