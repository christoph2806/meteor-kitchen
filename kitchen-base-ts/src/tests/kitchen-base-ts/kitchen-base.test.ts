import { expect } from 'chai';
import { KBaseProperty } from '../../kitchen-base/kitchen-base.ts'; // Adjust the path based on the location of KBaseProperty

describe('KBaseProperty Class', () => {
    let property: KBaseProperty;

    beforeEach(() => {
        property = new KBaseProperty(
            'testProperty',
            'string',
            'subTypeExample',
            'defaultValue',
            'Title Example',
            'Description Example',
            'Input Example',
            ['choice1', 'choice2'],
            true
        );
    });

    describe('Constructor', () => {
        it('should initialize with all provided values', () => {
            expect(property.name).to.equal('testProperty');
            expect(property.type).to.equal('string');
            expect(property.subType).to.equal('subTypeExample');
            expect(property.defaultValue).to.equal('defaultValue');
            expect(property.title).to.equal('Title Example');
            expect(property.description).to.equal('Description Example');
            expect(property.input).to.equal('Input Example');
            expect(property.choiceItems).to.deep.equal(['choice1', 'choice2']);
            expect(property.required).to.be.true;
        });

        it('should initialize with default values for optional fields', () => {
            const defaultProperty = new KBaseProperty('defaultTest', 'number');
            expect(defaultProperty.subType).to.equal('');
            expect(defaultProperty.defaultValue).to.equal(null);
            expect(defaultProperty.title).to.equal('');
            expect(defaultProperty.description).to.equal('');
            expect(defaultProperty.input).to.equal('');
            expect(defaultProperty.choiceItems).to.deep.equal([]);
            expect(defaultProperty.required).to.be.false;
        });
    });

    describe('Properties', () => {
        it('should have the correct name', () => {
            expect(property.name).to.equal('testProperty');
        });

        it('should have the correct type', () => {
            expect(property.type).to.equal('string');
        });

        it('should have the correct subType', () => {
            expect(property.subType).to.equal('subTypeExample');
        });

        it('should have the correct defaultValue', () => {
            expect(property.defaultValue).to.equal('defaultValue');
        });

        it('should have the correct title', () => {
            expect(property.title).to.equal('Title Example');
        });

        it('should have the correct description', () => {
            expect(property.description).to.equal('Description Example');
        });

        it('should have the correct input', () => {
            expect(property.input).to.equal('Input Example');
        });

        it('should have the correct choiceItems', () => {
            expect(property.choiceItems).to.deep.equal(['choice1', 'choice2']);
        });

        it('should indicate if it is required', () => {
            expect(property.required).to.be.true;
        });
    });

    describe('Default Values', () => {
        it('should return null for defaultValue if not set', () => {
            const defaultProperty = new KBaseProperty('defaultTest', 'number');
            expect(defaultProperty.defaultValue).to.equal(null);
        });

        it('should set required to false if not provided', () => {
            const optionalProperty = new KBaseProperty('optionalTest', 'string');
            expect(optionalProperty.required).to.be.false;
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty strings for optional fields', () => {
            const emptyProperty = new KBaseProperty('emptyTest', 'boolean', '', '', '', '', '', [], false);
            expect(emptyProperty.subType).to.equal('');
            expect(emptyProperty.defaultValue).to.equal('');
            expect(emptyProperty.title).to.equal('');
            expect(emptyProperty.description).to.equal('');
            expect(emptyProperty.input).to.equal('');
            expect(emptyProperty.choiceItems).to.deep.equal([]);
            expect(emptyProperty.required).to.be.false;
        });

        it('should handle undefined values for optional fields', () => {
            const undefinedProperty = new KBaseProperty('undefinedTest', 'object', undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            expect(undefinedProperty.subType).to.equal('');
            expect(undefinedProperty.defaultValue).to.equal(null);
            expect(undefinedProperty.title).to.equal('');
            expect(undefinedProperty.description).to.equal('');
            expect(undefinedProperty.input).to.equal('');
            expect(undefinedProperty.choiceItems).to.deep.equal([]);
            expect(undefinedProperty.required).to.be.false;
        });
    });
});
