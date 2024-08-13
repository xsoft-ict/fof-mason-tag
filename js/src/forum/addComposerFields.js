import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import DiscussionComposer from 'flarum/common/components/DiscussionComposer';
import Composer from 'flarum/components/Composer';
import FieldsEditor from './components/FieldsEditor';
import FieldsEditorByTags from './components/FieldsEditorByTags';
import ByTagsComposer from './components/ByTagsComposer';
import TagDiscussionModal from 'flarum/tags/components/TagDiscussionModal';

export default function () {
    DiscussionComposer.prototype.masonAnswers = [];
    let byTagEnabled = app.data.resources[0].attributes['xsoft-mason-tag.by-tag'];
    let ByTagsUnit = new ByTagsComposer();
    let dTag = '';
    var tagChanged = '';

    extend(Composer.prototype, 'hide', function (e) {
        // remove the the fields from the headerItems...
        dTag = '';
    });

    extend(DiscussionComposer.prototype, 'headerItems', function (items) {
        if (!app.forum.canFillMasonFields()) {
            return;
        }

        // so this list contains whether a tag has fields!
        const matchingTags = ByTagsUnit.matchTags();
        if (byTagEnabled) {
            dTag = '';
            this.myFields = [];

            if (app.composer.fields.tags && app.composer.fields.tags.length > 0) {
                for (let selectedTagIndex = 0; selectedTagIndex < app.composer.fields.tags.length; selectedTagIndex++) {
                    let selectTagName = app.composer.fields.tags[selectedTagIndex].data.attributes.name;
                    for (let i = 0; i < matchingTags.length; i++) {
                        if (matchingTags[i].tagName == selectTagName) {
                            this.myFields = matchingTags[i].fields;
                            dTag = selectTagName;
                            break;
                        }
                    }
                    if (dTag != '') {
                        // Found valid selected tag
                        break;
                    }
                }
            }
            // this.myFields is a list of fields that match the selected tag only

            if (tagChanged != dTag) {
                // clear the decks after every tag change
                this.composer.fields.masonAnswers = [];
                tagChanged = dTag;
            }

            items.add(
                'mason-fields',
                <FieldsEditorByTags
                    bytags={this.myFields}
                    tags={this.composer.fields.tags}
                    answers={this.composer.fields.masonAnswers || []}
                    onchange={(answers) => {
                        this.composer.fields.masonAnswers = answers;
                    }}
                />
            );
        } else {
            items.add(
                'mason-fields',
                <FieldsEditor
                    answers={this.composer.fields.masonAnswers || []}
                    onchange={(answers) => {
                        this.composer.fields.masonAnswers = answers;
                    }}
                    ontagchange={(tags) => {
                        this.composer.fields.tags = tags;
                    }}
                />
            );
        }
    });

    extend(DiscussionComposer.prototype, 'data', function (data) {
        if (!app.forum.canFillMasonFields() || !this.composer.fields.masonAnswers) {
            return;
        }

        data.relationships = data.relationships || {};
        data.relationships.masonAnswers = this.composer.fields.masonAnswers;
    });
}
