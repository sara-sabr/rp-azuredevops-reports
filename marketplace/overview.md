# Azure Boards - IT Research and Prototyping - Reports

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

##  Setup Instructions
1. Create Shared Search ```Automation\Status Report\Latest Status Report```
   - Search Query ![Search Query Settings for Latest Status Report](/docs/latest-status-report-query.png)
   - Click on Column Options and for Columns, choose the following:
      - ID
      - Work Item Type
      - Title
      - State
      - Assigned To
      - Start Date
      - Due Date
      - Finish Date
      - Description
      - Action
      - Risk
      - Priority
      - Parent
      - Area Path
   - Click on Column Options and for Sorting, choose the following:
       - ID

2. Create Shared Search ```Automation\Status Report\Impediments```
   - Search Query ![Search Query Settings for Impediments](/docs/impediments-query.png)
   - Click on Column Options and for Columns, choose the following:
      - ID
      - Work Item Type
      - Title
      - Assigned To
      - State
      - Parent
   - Click on Column Options and for Sorting, choose the following:
       - ID
