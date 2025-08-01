import { PassageExtended } from '@/types/test-exam';
import { ActionButton } from '../action-button';

export function PassageRender({ passage }: { passage: PassageExtended }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div>
          <p className=" font-bold"> {passage.title} </p>
          <p className=" italic font-light">{passage.description}</p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            actionType="update"
            editType="editPassage"
            data={{ passage }}
          />
          <ActionButton
            actionType="delete"
            editType="deletePassage"
            data={{ passage }}
          />
        </div>
      </div>
      {passage.type === 'PASSAGE_SIMPLE' && (
        <p className="whitespace-pre-line"> {passage.content} </p>
      )}

      {passage.type === 'PASSAGE_MULTI_HEADING' && (
        <>
          {passage.passageHeadingList.map((passageHeading) => {
            return (
              <div key={passageHeading.id}>
                <div className="flex justify-between">
                  <p className="font-bold"> {passageHeading.title}</p>
                  <div className="flex gap-1">
                    <ActionButton
                      actionType="update"
                      editType="editPassageMultiHeading"
                      data={{ passageHeading }}
                    />
                    <ActionButton
                      actionType="delete"
                      editType="deletePassageHeading"
                      data={{ passageHeading }}
                    />
                  </div>
                </div>
                <p className=" whitespace-pre-line ">
                  {passageHeading.content}
                </p>
              </div>
            );
          })}
          <div className="flex justify-center mt-4">
            <ActionButton
              actionType="create"
              editType="createPassageHeading"
              data={{ passage }}
            >
              <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                + Add Paragraph
              </div>
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
}
